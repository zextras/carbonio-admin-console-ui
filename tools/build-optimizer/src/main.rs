use clap::{Parser, Subcommand};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant, SystemTime};
use walkdir::WalkDir;

const CACHE_TTL: Duration = Duration::from_secs(30);

#[derive(Parser)]
#[command(name = "build-optimizer")]
#[command(about = "High-performance build optimization tools")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Copy directories in parallel
    ParallelCopy {
        source: String,
        destination: String,
        #[arg(short, long, default_value = "4")]
        jobs: usize,
    },
    /// Check git status for all components in parallel
    GitStatus {
        #[arg(short, long, default_value = "apps")]
        apps_dir: String,
    },
    /// Run builds in parallel
    ParallelBuild {
        #[arg(short, long, default_value = "4")]
        jobs: usize,
        #[arg(long)]
        dev: bool,
        #[arg(long)]
        dry_run: bool,
        #[arg(long)]
        components: Option<String>,
    },
    /// Discover admin-ui components
    DiscoverComponents {
        #[arg(short, long, default_value = "apps")]
        apps_dir: String,
    },
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Component {
    name: String,
    target: String,
    path: PathBuf,
    has_changes: bool,
}

#[derive(Serialize, Deserialize, Debug)]
struct BuildResult {
    component: String,
    success: bool,
    output: String,
}

#[derive(Serialize, Deserialize)]
struct GitStatusCache {
    timestamp: u64,
    git_index_hash: String,
    results: HashMap<String, bool>,
}

#[derive(Serialize, Deserialize)]
struct ComponentDiscoveryCache {
    timestamp: u64,
    dir_hash: String,
    components: Vec<Component>,
}

static COPIED_BYTES: AtomicU64 = AtomicU64::new(0);

fn get_cache_dir() -> PathBuf {
    env::var("XDG_CACHE_HOME")
        .map(PathBuf::from)
        .ok()
        .or_else(|| {
            env::var("HOME").ok().map(|h| {
                PathBuf::from(h).join(".cache")
            })
        })
        .unwrap_or_else(|| PathBuf::from("/tmp"))
        .join("build-optimizer")
}

fn get_git_index_hash(repo_dir: &Path) -> Option<String> {
    Command::new("git")
        .args(["write-tree"])
        .current_dir(repo_dir)
        .output()
        .ok()
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .map(|s| s.trim().to_string())
}

fn is_cache_valid(timestamp: u64) -> bool {
    let now = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    now.saturating_sub(timestamp) < CACHE_TTL.as_secs()
}

fn copy_directory_parallel(
    source: &Path,
    destination: &Path,
    _jobs: usize,
) -> Result<(), io::Error> {
    let start = Instant::now();

    // First, walk the directory and collect all file operations
    let mut file_ops = Vec::new();
    let mut dir_ops = Vec::new();

    // Optimize WalkDir: don't follow symlinks
    for entry in WalkDir::new(source)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let src_path = entry.path();
        let rel_path = src_path.strip_prefix(source).unwrap();
        let dest_path = destination.join(rel_path);

        if src_path.is_dir() {
            dir_ops.push(dest_path);
        } else {
            file_ops.push((src_path.to_path_buf(), dest_path));
        }
    }

    // Create all directories first
    dir_ops
        .par_iter()
        .try_for_each(|dir| fs::create_dir_all(dir))?;

    // Copy files in parallel using std::fs::copy for better performance
    let results: Vec<_> = file_ops
        .par_iter()
        .map(|(src, dest)| {
            // Ensure parent directory exists
            if let Some(parent) = dest.parent() {
                let _ = fs::create_dir_all(parent);
            }

            let result = fs::copy(src, dest);

            if let Ok(metadata) = fs::metadata(src) {
                COPIED_BYTES.fetch_add(metadata.len(), Ordering::Relaxed);
            }

            (src, result)
        })
        .collect();

    // Collect and return any errors
    let errors: Vec<_> = results
        .into_iter()
        .filter_map(|(src, result)| result.err().map(|e| (src, e)))
        .collect();

    if !errors.is_empty() {
        return Err(io::Error::new(
            io::ErrorKind::Other,
            format!("Failed to copy {} files", errors.len()),
        ));
    }

    let total_bytes = COPIED_BYTES.load(Ordering::Relaxed);
    let duration = start.elapsed();
    let mb_copied = total_bytes as f64 / 1024.0 / 1024.0;
    let throughput = mb_copied / duration.as_secs_f64();

    println!(
        "Copied: {:.2} MB in {:.2}s ({:.2} MB/s)",
        mb_copied,
        duration.as_secs_f64(),
        throughput
    );

    Ok(())
}

fn git_status_parallel(apps_dir: &Path) -> Result<HashMap<String, bool>, io::Error> {
    let cache_dir = get_cache_dir();
    let cache_file = cache_dir.join("git-status.json");

    // Try to load from cache
    if let Ok(cache_content) = fs::read_to_string(&cache_file) {
        if let Ok(cache) = serde_json::from_str::<GitStatusCache>(&cache_content) {
            if is_cache_valid(cache.timestamp) {
                if let Some(current_hash) = get_git_index_hash(apps_dir) {
                    if current_hash == cache.git_index_hash {
                        return Ok(cache.results);
                    }
                }
            }
        }
    }

    // Get all admin-ui directories
    let components: Vec<_> = fs::read_dir(apps_dir)?
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            entry
                .file_name()
                .to_string_lossy()
                .starts_with("admin-ui-")
        })
        .collect();

    let results_vec: Vec<_> = components
        .par_iter()
        .map(|entry| {
            let component_name = entry.file_name().to_string_lossy().into_owned();
            // Use current_dir instead of hardcoded path prefix
            let output = Command::new("git")
                .args(["status", "--porcelain", &component_name])
                .current_dir(apps_dir)
                .output();

            let has_changes = match output {
                Ok(result) => !result.stdout.is_empty(),
                Err(_) => true, // Assume changes if git fails
            };

            (component_name, has_changes)
        })
        .collect();

    let mut results = HashMap::new();
    for (name, has_changes) in results_vec {
        results.insert(name, has_changes);
    }

    // Cache the results
    let git_index_hash = get_git_index_hash(apps_dir).unwrap_or_default();
    let cache = GitStatusCache {
        timestamp: SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        git_index_hash,
        results: results.clone(),
    };

    let _ = fs::create_dir_all(&cache_dir);
    let _ = fs::write(
        &cache_file,
        serde_json::to_string(&cache).unwrap_or_default(),
    );

    Ok(results)
}

fn discover_components(apps_dir: &Path) -> Result<Vec<Component>, io::Error> {
    let cache_dir = get_cache_dir();
    let cache_file = cache_dir.join("components.json");

    // Compute directory hash for cache invalidation
    let dir_hash = fs::read_dir(apps_dir)?
        .filter_map(|entry| entry.ok())
        .map(|e| e.file_name().to_string_lossy().into_owned())
        .collect::<Vec<_>>()
        .join(",");

    // Try to load from cache
    if let Ok(cache_content) = fs::read_to_string(&cache_file) {
        if let Ok(cache) = serde_json::from_str::<ComponentDiscoveryCache>(&cache_content) {
            if is_cache_valid(cache.timestamp) && cache.dir_hash == dir_hash {
                return Ok(cache.components);
            }
        }
    }

    let entries: Vec<_> = fs::read_dir(apps_dir)?
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            let file_name = entry.file_name();
            let name = file_name.to_string_lossy();
            name.starts_with("admin-ui-") && entry.path().is_dir()
        })
        .collect();

    let results: Vec<Component> = entries
        .par_iter()
        .map(|entry| {
            let dir_name = entry.file_name().to_string_lossy().into_owned();
            let package_path = entry.path().join("package.json");

            let target = if package_path.exists() {
                match fs::read_to_string(&package_path) {
                    Ok(content) => {
                        serde_json::from_str::<serde_json::Value>(&content)
                            .ok()
                            .and_then(|json| {
                                json.get("carbonio")
                                    .and_then(|c| c.get("name"))
                                    .and_then(|n| n.as_str())
                                    .map(String::from)
                            })
                    }
                    Err(_) => None,
                }
            } else {
                None
            };

            let target_name = target.unwrap_or_else(|| {
                format!(
                    "carbonio-admin-ui-{}",
                    dir_name.trim_start_matches("admin-ui-")
                )
            });

            Component {
                name: dir_name,
                target: target_name,
                path: entry.path().clone(),
                has_changes: false, // Will be filled by git status
            }
        })
        .collect();

    // Cache the results
    let cache = ComponentDiscoveryCache {
        timestamp: SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        dir_hash,
        components: results.clone(),
    };

    let _ = fs::create_dir_all(&cache_dir);
    let _ = fs::write(
        &cache_file,
        serde_json::to_string(&cache).unwrap_or_default(),
    );

    Ok(results)
}

fn parallel_build(
    components: &[Component],
    jobs: usize,
    dev_mode: bool,
    dry_run: bool,
) -> Vec<BuildResult> {
    let pool = rayon::ThreadPoolBuilder::new()
        .num_threads(jobs)
        .build()
        .unwrap();

    pool.install(|| {
        components
            .par_iter()
            .map(|component| {
                let build_cmd = if dev_mode {
                    "pnpm build:dev"
                } else {
                    "pnpm build"
                };

                println!("Building {}...", component.name);

                if dry_run {
                    println!("  {} (dry run)", component.name);
                    return BuildResult {
                        component: component.name.clone(),
                        success: true,
                        output: format!("DRY RUN: Would execute '{}'", build_cmd),
                    };
                }

                let output = Command::new("sh")
                    .arg("-c")
                    .arg(build_cmd)
                    .current_dir(&component.path)
                    .output();

                let (success, output_str) = match output {
                    Ok(result) => {
                        let success = result.status.success();
                        let stdout = String::from_utf8_lossy(&result.stdout);
                        let stderr = String::from_utf8_lossy(&result.stderr);
                        (success, format!("STDOUT:\n{}\nSTDERR:\n{}", stdout, stderr))
                    }
                    Err(e) => (false, format!("Failed to execute: {}", e)),
                };

                let status = if success { "OK" } else { "FAILED" };
                println!("  {} {}", component.name, status);

                BuildResult {
                    component: component.name.clone(),
                    success,
                    output: output_str,
                }
            })
            .collect()
    })
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    match cli.command {
        Commands::ParallelCopy {
            source,
            destination,
            jobs,
        } => {
            println!("Copying {} to {} with {} jobs", source, destination, jobs);
            copy_directory_parallel(Path::new(&source), Path::new(&destination), jobs)?;
        }

        Commands::GitStatus { apps_dir } => {
            println!("Checking git status for all components...");
            let results = git_status_parallel(Path::new(&apps_dir))?;

            for (component, has_changes) in results {
                let status = if has_changes {
                    "CHANGES"
                } else {
                    "CLEAN"
                };
                println!("  {}: {}", component, status);
            }
        }

        Commands::ParallelBuild {
            jobs,
            dev,
            dry_run,
            components,
        } => {
            println!(
                "Building components in parallel with {} jobs{}",
                jobs,
                if dry_run { " (dry run)" } else { "" }
            );

            // First discover components
            let all_components = discover_components(Path::new("apps"))?;

            // Filter to only requested components if specified
            let components_to_build = if let Some(ref filter_list) = components {
                use std::collections::HashSet;
                let filters: HashSet<&str> = filter_list.split(',').map(|s| s.trim()).collect();
                all_components
                    .into_iter()
                    .filter(|c| filters.contains(c.name.as_str()))
                    .collect()
            } else {
                all_components
            };

            println!("Found {} components to build", components_to_build.len());

            // Build them
            let results = parallel_build(&components_to_build, jobs, dev, dry_run);

            // Report results
            let success_count = results.iter().filter(|r| r.success).count();

            println!(
                "\nSummary: {} of {} components succeeded",
                success_count,
                results.len()
            );

            // Show failures
            for result in &results {
                if !result.success {
                    println!("\n {} failed:", result.component);
                    println!("{}", result.output);
                }
            }
        }

        Commands::DiscoverComponents { apps_dir } => {
            println!("Discovering admin-ui components...");
            let components = discover_components(Path::new(&apps_dir))?;

            println!("\nFound {} components:", components.len());
            for component in components {
                println!("  {} -> {}", component.name, component.target);
            }
        }
    }

    Ok(())
}
