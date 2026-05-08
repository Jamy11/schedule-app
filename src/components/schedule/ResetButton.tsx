interface ResetButtonProps {
  onClick: () => void;
}

export default function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mt-5 rounded-xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition no-print"
    >
      Reset Everything
    </button>
  );
}
