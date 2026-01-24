const steps = ["Personal Information", "Document Upload", "Terms & Conditions"];

export default function ProgressBar({ step }: Readonly<{ step: number }>) {
  return (
    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5">
      <h4
        data-slot="card-title"
        className="leading-none text-brand-blue text-center"
      >
        {steps[step-1]}
      </h4>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-brand-blue h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
