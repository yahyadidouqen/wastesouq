const steps = [
  { label: "Publier", number: 1 },
  { label: "Vérifier", number: 2 },
  { label: "Confirmer", number: 3 },
];

export default function ProgressBar({ currentStep = 1 }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step.number < currentStep ? "bg-green-500 text-white" : ""}
                ${step.number === currentStep ? "bg-[#1B4332] text-white ring-4 ring-[#D8F3DC]" : ""}
                ${step.number > currentStep ? "bg-gray-200 text-gray-400" : ""}
              `}
            >
              {step.number < currentStep ? "✓" : step.number}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block
                ${step.number === currentStep ? "text-[#1B4332]" : "text-gray-400"}
              `}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-10 h-0.5 mx-1 ${step.number < currentStep ? "bg-green-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
