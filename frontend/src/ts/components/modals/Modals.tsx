import { JSXElement } from "solid-js";

import { CommandlineModal } from "./CommandlineModal";
import { ContactModal } from "./ContactModal";
import { CustomGeneratorModal } from "./CustomGeneratorModal";
import { CustomTestDurationModal } from "./CustomTestDurationModal";
import { CustomTextModal } from "./CustomTextModal";
import { CustomWordAmountModal } from "./CustomWordAmountModal";
import { EventLogViewerModal } from "./EventLogViewerModal";
import { MobileTestConfigModal } from "./MobileTestConfigModal";
import { PractiseWordsModal } from "./PractiseWordsModal";
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
      <ShareTestSettings />
      <TheRestModal />
      <WordFilterModal />
    </>
  );
}
