import { StarIcon, VerifiedIcon } from "@/components/Icons";
import CustomerReviewCard from "@/components/about-us/CustomerReviewCard";

type PropsT = {
    title: string;
    totalRating: string;
    reviewsCount: string;
    description: string;
    authors: {
        rating: string;
        message: string;
        imgUrl: string;
        name: string;
        designation: string;
        location: string;
    }[];
};

export default function CustomerReviews({ data }: Readonly<{ data: PropsT }>) {
    return (
        <section className="py-16 bg-[rgba(220,226,239,0.5)]">
            <div className="container mx-auto px-4 lg:px-[140px]">
                <div className="text-center mb-10">
                    <h2 className="text-3xl lg:text-[44px] leading-normal font-semibold text-neutral-950 mb-3.5">
                        {data.title}
                    </h2>
                    <p className="text-[15px] leading-normal font-normal text-[#4a5565]">
                        {data.description}
                    </p>
                </div>
                <div className="flex gap-4 mx-auto overflow-x-auto snap-x snap-mandatory">
                    {data.authors.map((author) => (
                        <div
                            key={author.name}
                            className="snap-start shrink-0 w-9/10 lg:w-1/2"
                        >
                            <CustomerReviewCard data={author}/>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                        <div className="flex items-center gap-2">
                            <VerifiedIcon className="w-6 h-6 text-[#208bc9]" />
                            <span className="text-[14px] font-medium text-[#24272c]">
                                Verified Reviews
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[20px] font-bold text-[#202c4a]">
                                {data.totalRating}/5
                            </span>
                            <div className="flex gap-1">
                                {[...new Array(5)].map((_, index) => (
                                    <StarIcon
                                        key={index}
                                        className="h-4 w-4 text-[#ffc107]"
                                        filled={true}
                                    />
                                ))}
                            </div>
                            <span className="text-[14px] text-[#4a5565]">
                                ({data.reviewsCount} reviews)
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
