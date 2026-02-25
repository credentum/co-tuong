interface BottomSheetProps {
  children: React.ReactNode
}

export function BottomSheet({ children }: BottomSheetProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-white px-4 pb-6 pt-3 shadow-lg">
      {children}
    </div>
  )
}
