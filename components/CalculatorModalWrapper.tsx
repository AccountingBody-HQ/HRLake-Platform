"use client"
import EmailCaptureModal from '@/components/EmailCaptureModal'

export default function CalculatorModalWrapper() {
  return (
    <EmailCaptureModal
      trigger="timer"
      delaySeconds={30}
      source="calculator_page_timer"
      title="Save your calculation and stay informed."
      subtitle="Get monthly global payroll updates — rate changes, new country data, and compliance alerts. Free."
    />
  )
}
