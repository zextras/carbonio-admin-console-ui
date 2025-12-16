/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  useCurrentUserRights,
  useIsAdvanced,
} from "@zextras/admin-ui-bootstrap";
import { useSnackbar } from "@zextras/carbonio-design-system";
import { find, isEqual, reduce } from "lodash-es";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  COS,
  MOBILE_CALENDAR_FEATURE_SYNC,
  MOBILE_CONTACT_FEATURE_SYNC,
  ZIMBRA_ADMIN_URN,
} from "../../constants";
import { flushCache } from "../../services/flush-cache-service";
import { getCoreAttributes } from "../../services/get-core-attributes";
import { modifyCos, ModifyCosBody } from "../../services/modify-cos-service";
import { setCoreAttributes } from "../../services/set-core-attributes";
import { useCosStore } from "../../store/cos/store";
import { PageLayout } from "../page-layout";
import { Features } from "./features";

const CosFeatures: FC = () => {
  const [t] = useTranslation();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const createSnackbar = useSnackbar();
  const cosInformation = useCosStore((state) => state.cos?.a);
  const cosName = useCosStore((state) => state.cos?.name);
  const [initCosData, setInitCosData]: any = useState({});
  const [zimbraId, setZimbraId] = useState<string>("");
  const setCos = useCosStore((state) => state.setCos);
  const [cosFeatures, setCosFeatures] = useState<any>({});
  const isAdvanced = useIsAdvanced();
  const { data: rights = [] } = useCurrentUserRights();

  const readonlyCOS = useMemo(() => {
    const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
    return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
  }, [rights]);

  const setSwitchOptionValue = useCallback(
    (key: string, value: string): void => {
      setInitCosData((prev: Record<string, string>) => ({
        ...prev,
        [key]: value,
      }));
      setCosFeatures((prev: Record<string, string>) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setCosFeatures, setInitCosData],
  );

  const getMobileFeatureSync = useCallback(() => {
    const body = [
      {
        configType: COS,
        configName: [cosName],
        attrName: ["mobileContactFeatureSync", "mobileCalendarFeatureSync"],
      },
    ];
    getCoreAttributes(body)
      .then((data) => {
        if (data?.attributes) {
          setSwitchOptionValue(
            "mobileContactFeatureSync",
            data?.attributes?.mobileContactFeatureSync[0]?.value === "enabled"
              ? "TRUE"
              : "FALSE",
          );
          setSwitchOptionValue(
            "mobileCalendarFeatureSync",
            data?.attributes?.mobileCalendarFeatureSync[0]?.value === "enabled"
              ? "TRUE"
              : "FALSE",
          );
        }
      })
      .catch((error) => {
        createSnackbar({
          key: "error",
          severity: "error",
          label: error?.message
            ? error?.message
            : t(
                "label.something_wrong_error_msg",
                "Something went wrong. Please try again.",
              ),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  }, [cosName, createSnackbar, setSwitchOptionValue, t]);

  const setInitialValues = useCallback(
    (obj: any) => {
      if (obj) {
        setSwitchOptionValue(
          "carbonioFeatureMailsAppEnabled",
          obj?.carbonioFeatureMailsAppEnabled,
        );
        setSwitchOptionValue(
          "zimbraFeatureOutOfOfficeReplyEnabled",
          obj?.zimbraFeatureOutOfOfficeReplyEnabled,
        );
        setSwitchOptionValue(
          "zimbraFeatureSignaturesEnabled",
          obj?.zimbraFeatureSignaturesEnabled,
        );
        setSwitchOptionValue(
          "zimbraFeatureMobileSyncEnabled",
          obj?.zimbraFeatureMobileSyncEnabled,
        );
        setSwitchOptionValue(
          "zimbraFeatureContactsEnabled",
          obj?.zimbraFeatureContactsEnabled,
        );
        setSwitchOptionValue(
          "zimbraFeatureCalendarEnabled",
          obj?.zimbraFeatureCalendarEnabled,
        );
        setSwitchOptionValue(
          "carbonioFeatureFilesAppEnabled",
          obj?.carbonioFeatureFilesAppEnabled,
        );
        setSwitchOptionValue(
          "carbonioFeatureFilesEnabled",
          obj?.carbonioFeatureFilesEnabled,
        );
        setSwitchOptionValue(
          "carbonioFeatureTeamEnabled",
          obj?.carbonioFeatureTeamEnabled,
        );
        setSwitchOptionValue(
          "carbonioFeatureChatsAppEnabled",
          obj?.carbonioFeatureChatsAppEnabled,
        );
        setSwitchOptionValue(
          "carbonioFeatureTasksEnabled",
          obj?.carbonioFeatureTasksEnabled,
        );
        setSwitchOptionValue(
          "zimbraFeatureOptionsEnabled",
          obj?.zimbraFeatureOptionsEnabled,
        );
        setSwitchOptionValue(
          "carbonioFeatureOTPMgmtEnabled",
          obj?.carbonioFeatureOTPMgmtEnabled,
        );
      }
    },
    [setSwitchOptionValue],
  );

  useEffect(() => {
    if (!!cosInformation && cosInformation.length > 0) {
      const obj: any = {};
      cosInformation.forEach((item: any) => {
        obj[item?.n] = item._content;
      });
      setZimbraId(obj?.zimbraId);
      setInitialValues(obj);
      setIsDirty(false);
    }
  }, [cosInformation, setInitialValues, setSwitchOptionValue, setZimbraId]);

  useEffect(() => {
    if (zimbraId && !isEqual(cosFeatures, initCosData)) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [cosFeatures, initCosData, zimbraId]);

  useEffect(() => {
    if (isAdvanced && cosName) {
      getMobileFeatureSync();
    }
  }, [cosName, getMobileFeatureSync, isAdvanced]);

  const modifyCosRequest = (body: ModifyCosBody): void => {
    modifyCos(body)
      .then((data) => {
        flushCache("cos", "id", body.id._content);
        createSnackbar({
          key: "success",
          severity: "success",
          label: t(
            "label.change_save_success_msg",
            "The change has been saved successfully",
          ),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        const cos: any = data.cos[0];
        if (cos) {
          setCos(cos);
        }
      })
      .catch((error) => {
        createSnackbar({
          key: "error",
          severity: "error",
          label: error?.message
            ? error?.message
            : t(
                "label.something_wrong_error_msg",
                "Something went wrong. Please try again.",
              ),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  };

  const modifyCoreAttributes = (body: any): void => {
    setCoreAttributes(body)
      .then((data: any) => {
        setSwitchOptionValue(
          "mobileContactFeatureSync",
          cosFeatures?.mobileContactFeatureSync,
        );
        setSwitchOptionValue(
          "mobileCalendarFeatureSync",
          cosFeatures?.mobileCalendarFeatureSync,
        );
      })
      .catch((error) => {
        createSnackbar({
          key: "error",
          severity: "error",
          label: error?.message
            ? error?.message
            : t(
                "label.something_wrong_error_msg",
                "Something went wrong. Please try again.",
              ),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  };

  const onSave = (): void => {
    const body: ModifyCosBody = {
      _jsns: ZIMBRA_ADMIN_URN,
      id: {
        _content: zimbraId,
      },
    } as ModifyCosBody;
    body.a = Object.keys(cosFeatures)
      .filter(
        (ele) =>
          ele !== MOBILE_CALENDAR_FEATURE_SYNC &&
          ele !== MOBILE_CONTACT_FEATURE_SYNC,
      )
      .map((ele) => ({ n: ele, _content: cosFeatures[ele] }));

    const modifiedKeys: any = reduce(
      cosFeatures,
      (result, value, key): any =>
        isEqual(value, initCosData[key]) ? result : [...result, key],
      [],
    );
    if (
      (modifiedKeys.includes(MOBILE_CALENDAR_FEATURE_SYNC) ||
        modifiedKeys.includes(MOBILE_CONTACT_FEATURE_SYNC)) &&
      isAdvanced
    ) {
      const coreAttrBody: any = {
        mobileCalendarFeatureSync: {
          value:
            cosFeatures.mobileCalendarFeatureSync === "TRUE"
              ? "enabled"
              : "disabled",
          objectName: cosName,
          configType: COS,
        },
        mobileContactFeatureSync: {
          value:
            cosFeatures.mobileContactFeatureSync === "TRUE"
              ? "enabled"
              : "disabled",
          objectName: cosName,
          configType: COS,
        },
      };
      modifyCoreAttributes(coreAttrBody);
    }
    modifyCosRequest(body);
  };

  const onCancel = (): void => {
    setCosFeatures(initCosData);
    setIsDirty(false);
  };

  return (
    <PageLayout
      title={t("cos.features", "Features")}
      onSave={onSave}
      onCancel={onCancel}
      unSavedChanges={isDirty}
    >
      <Features
        featuresDetail={cosFeatures}
        setFeaturesDetail={setCosFeatures}
        readonlyFeatures={readonlyCOS}
        cosLevelFeatures
      />
    </PageLayout>
  );
};

export default CosFeatures;
