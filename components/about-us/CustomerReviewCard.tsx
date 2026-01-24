import { StarIcon } from "../Icons";
import Image from "@/elements/Image";

type PropsT = {
    rating: string;
    message: string;
    imgUrl: string;
    name: string;
    designation: string;
    location: string;
};

export default function CustomerReviewCard({
    data,
}: Readonly<{ data: PropsT }>) {
    return (
        <div className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.1)] p-8 flex flex-col min-h-65">
            <div className="flex gap-1 mb-4">
                {[...new Array(Number(data.rating))].map((_, index) => (
                    <StarIcon
                        key={index}
                        className="h-4 w-4 text-[#ffc107]"
                        filled={true}
                    />
                ))}
            </div>
            <blockquote className="text-[15px] leading-6.5 font-normal text-[#24272c] mb-6 flex-1 italic line-clamp-3">
                {data.message}
            </blockquote>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image
                        width={392}
                        height={500}
                        src="/assets/home-banner.avif"
                        alt="user-profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h4 className="text-[16px] leading-5 font-medium text-[#202c4a] mb-1">
                        {data.name}
                    </h4>
                    <p className="text-[13px] leading-4 font-normal text-[#4a5565] mb-1">
                        {data.designation}
                    </p>
                    <p className="text-[12px] leading-[15px] font-normal text-[#8f9193]">
                        {data.location}
                    </p>
                </div>
            </div>
        </div>
    );
}
