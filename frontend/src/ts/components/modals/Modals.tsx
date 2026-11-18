import { JSXElement } from "solid-js";

import { CommandlineModal } from "./CommandlineModal";
import { ContactModal } from "./ContactModal";
import { CustomTestDurationModal } from "./CustomTestDurationModal";
import { CustomTextModal } from "./CustomTextModal";
import { CustomWordAmountModal } from "./CustomWordAmountModal";
import { EventLogViewerModal } from "./EventLogViewerModal";
import { MobileTestConfigModal } from "./MobileTestConfigModal";
import { PractiseWordsModal } from "./PractiseWordsModal";
import { ShareTestSettings } from "./ShareTestSettings";
import { SimpleModal } from "./SimpleModal";
import { TheRestModal } from "./TheRestModal";

export function Modals(): JSXElement {
  return (
    <>
      <CommandlineModal />
      <ContactModal />
      <SimpleModal />
      <CustomTextModal />
      <CustomWordAmountModal />
      <EventLogViewerModal />
      <CustomTestDurationModal />
      <PractiseWordsModal />
      <MobileTestConfigModal />
      <ShareTestSettings />
      <TheRestModal />
    </>
  );
}
