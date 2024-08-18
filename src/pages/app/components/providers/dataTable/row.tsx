import React, { memo, useMemo } from "react";
import { DataTable } from "react-native-paper";
import { CurrAppProps } from "@/states/computed/currApp";
import { interpolate, useTranslations } from "@/states/persistent/translations";
import { CopiableCell, SecureCell, WebsiteCell } from "./cells";

const ProvidersDataTableRow = memo(
  ({
    currApp,
    provider,
    tableSize,
  }: {
    currApp: CurrAppProps;
    provider: string;
    tableSize: { provider: number; packageName: number; version: number };
  }) => {
    const translations = useTranslations();

    const copiableCellProps = useMemo(
      () => [
        {
          onPressMessage: interpolate(
            translations["Long press to copy $1 package name"],
            provider
          ),
          onLongPressMessage: interpolate(
            translations["$1's package name copied to clipboard"],
            provider
          ),
          toCopy: currApp.providers[provider].packageName,
          width: tableSize.packageName,
        },
        {
          onPressMessage: interpolate(
            translations["Long press to copy $1 version"],
            provider
          ),
          onLongPressMessage: interpolate(
            translations["$1's version copied to clipboard"],
            provider
          ),
          toCopy: currApp.providers[provider].version,
          width: tableSize.version,
        },
        {
          onPressMessage: interpolate(
            translations["Long press to copy $1 SHA-256"],
            provider
          ),
          onLongPressMessage: interpolate(
            translations["$1's SHA-256 copied to clipboard"],
            provider
          ),
          toCopy: currApp.providers[provider].sha256,
          width: 175,
        },
      ],
      [currApp.providers, provider, translations, tableSize]
    );

    return (
      <DataTable.Row>
        <WebsiteCell
          size={tableSize.provider}
          provider={provider}
          currApp={currApp}
          translations={translations}
        />
        <SecureCell
          sha256={currApp.providers[provider].sha256}
          translations={translations}
        />
        {copiableCellProps.map((props, index) => (
          <CopiableCell key={`${provider}-${index}`} {...props} />
        ))}
      </DataTable.Row>
    );
  }
);

export default ProvidersDataTableRow;
