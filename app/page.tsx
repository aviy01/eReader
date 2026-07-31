import { DocumentProvider } from "@/lib/document-context";
import { VaultProvider } from "@/lib/vault-context";
import { LanguageProvider } from "@/lib/language-context";
import { ReaderUIProvider } from "@/lib/reader-ui-context";
import { AppShell } from "@/components/layout/app-shell";
import { DocumentStage } from "@/components/reader/document-stage";

export default function Home() {
  return (
    <LanguageProvider>
      <VaultProvider>
        <DocumentProvider>
          <ReaderUIProvider>
            <AppShell>
              <DocumentStage />
            </AppShell>
          </ReaderUIProvider>
        </DocumentProvider>
      </VaultProvider>
    </LanguageProvider>
  );
}
