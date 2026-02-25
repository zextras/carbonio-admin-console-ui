/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import 'tinymce/tinymce';
import 'tinymce/models/dom/model';
// Theme
import 'tinymce/themes/silver';
// Toolbar icons
import 'tinymce/icons/default';
// Editor styles
import 'tinymce/skins/ui/oxide/skin';
// Content styles, including inline UI like fake cursors
import 'tinymce/skins/content/default/content';
import 'tinymce/skins/ui/oxide/content';
// importing the plugin js.
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/help';
import 'tinymce/plugins/image';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/wordcount';

import { Editor, type IAllProps as EditorProps } from '@tinymce/tinymce-react';
import { getLocale } from '@zextras/admin-ui-bootstrap';
import { Container } from '@zextras/ui-components';
import React, { useCallback, useMemo } from 'react';

import {
  DEFAULT_FONT_SIZE_FORMATS,
  DEFAULT_PLUGINS,
  DEFAULT_STYLE_FORMATS,
  generateToolbarConfig,
  SUPPORTED_LOCALES,
} from './utils';

type ComposerProps = EditorProps & {
  /** The callback invoked when an edit is performed into the editor. `([text, html]) => {}` */
  onEditorChange?: (values: [string, string]) => void;
  /** Enable the distraction-free mode */
  inline?: boolean;
  /** The initial content of the editor */
  initialValue?: EditorProps['initialValue'];
  /** The content of the editor (controlled mode) */
  value?: EditorProps['value'];
  /**
   * Callback called when user choose some file from the os.
   * If defined, a menu item to add inline images is added to the composer.
   */
  customInitOptions?: Partial<EditorProps['init']>;
};

const Composer = ({
  onEditorChange,
  inline = false,
  value,
  initialValue,
  customInitOptions,
  ...rest
}: ComposerProps): React.JSX.Element => {
  const isControlledMode = useMemo(() => !!onEditorChange, [onEditorChange]);

  const _onEditorChange = useCallback<NonNullable<EditorProps['onEditorChange']>>(
    (_, editor) => {
      onEditorChange?.([
        editor.getContent({ format: 'text' }),
        editor.getContent({ format: 'html' }),
      ]);
    },
    [onEditorChange],
  );

  const locale = getLocale();
  const language = useMemo(() => {
    const localeObj =
      locale in SUPPORTED_LOCALES && SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES];
    return (
      (localeObj &&
        (('tinymceLocale' in localeObj && localeObj?.tinymceLocale) || localeObj?.value)) ||
      locale
    );
  }, [locale]);

  const editorInitConfig = useMemo<EditorProps['init']>(
    () => ({
      language_url: `${BASE_PATH}tinymce/langs/${language}.js`,
      language,
      min_height: 350,
      auto_focus: true,
      menubar: false,
      statusbar: false,
      branding: false,
      resize: true,
      inline,
      font_size_formats: DEFAULT_FONT_SIZE_FORMATS,
      object_resizing: 'img',
      style_formats: DEFAULT_STYLE_FORMATS,
      plugins: DEFAULT_PLUGINS,
      toolbar: generateToolbarConfig(),
      contextmenu: [''],
      toolbar_mode: 'wrap',
      visualblocks_default_state: false,
      end_container_on_empty_block: true,
      relative_urls: false,
      remove_script_host: false,
      newline_behavior: 'default',
      browser_spellcheck: true,
      convert_unsafe_embeds: true,
      ...customInitOptions,
    }),

    [language, inline, customInitOptions],
  );

  return (
    <Container
      height="100%"
      crossAlignment="baseline"
      mainAlignment="flex-start"
      style={{ overflowY: 'hidden' }}
    >
      <Editor
        licenseKey="gpl"
        initialValue={initialValue}
        value={value}
        init={editorInitConfig}
        onEditorChange={isControlledMode ? _onEditorChange : undefined}
        {...rest}
      />
    </Container>
  );
};

export default Composer;
