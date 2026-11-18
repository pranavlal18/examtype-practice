import { JSXElement } from "solid-js";

import { CommandlineModal } from "./CommandlineModal";
import { ContactModal } from "./ContactModal";
import { CustomTestDurationModal } from "./CustomTestDurationModal";
import { CustomTextModal } from "./CustomTextModal";
import { CustomWordAmountModal } from "./CustomWordAmountModal";
import { CustomGeneratorModal } from "./CustomGeneratorModal";
import { EventLogViewerModal } from "./EventLogViewerModal";
import { MobileTestConfigModal } from "./MobileTestConfigModal";
import { PractiseWordsModal } from "./PractiseWordsModal";
import { SavedTextsModal } from "./SavedTextsModal";
import { SaveCustomTextModal } from "./SaveCustomTextModal";
import { ShareTestSettings } from "./ShareTestSettings";
import { SimpleModal } from "./SimpleModal";
import { SupportModal } from "./SupportModal";
import { TheRestModal } from "./TheRestModal";
import { WordFilterModal } from "./WordFilterModal";

export function Modals(): JSXElement {
  return (
    <>
      <CommandlineModal />
      <ContactModal />
      <SupportModal />
      <SimpleModal />
      <CustomTextModal />
      <CustomWordAmountModal />
      <CustomGeneratorModal />
      <EventLogViewerModal />
      <CustomTestDurationModal />
      <PractiseWordsModal />
      <MobileTestConfigModal />
      <SavedTextsModal />
      <SaveCustomTextModal />
      <ShareTestSettings />
      <TheRestModal />
      <WordFilterModal />
    </>
  );
}
