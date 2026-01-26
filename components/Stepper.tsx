import { CheckCircleIcon } from "@/components/Icons";

export default function Stepper({ step }: Readonly<{ step: number }>) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {[...new Array(3).keys()].map((i) => (
          <div key={i} className={`${i !== 2 && "flex-1"} flex items-center`}>
            <div
              className={`${
                step > i + 1 ? "bg-green-500" : "bg-brand-blue"
              } flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-medium text-white`}
            >
              {step > i+1 ? <CheckCircleIcon /> : i + 1}
            </div>
            {i !== 2 && (
              <div
                className={`${
                  step > i + 1 ? "bg-green-500" : "bg-gray-200"
                } w-full h-1 mr-3`}
              ></div>
            )}
          </div>
        ))}

        {/* <div className="flex flex-1 items-center">
          <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-medium bg-gray-200 text-gray-500">
            2
          </div>
          <div
            className={`${
              step > 2 ? "bg-green-500" : "bg-gray-200"
            } w-full h-1 mr-3`}
          ></div>
        </div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium bg-gray-200 text-gray-500">
            3
          </div>
        </div> */}
      </div>
      <div className="text-center">
        <span
          data-slot="badge"
          className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 text-brand-blue border-brand-blue"
        >
          Step {step} of 3
        </span>
      </div>
    </div>
  );
}
