import SellerOnboard from "@/components/SellerOnboard";

const data = {
  title: "Create Your Seller Account",
  subTitle:
    "Register as a seller to export vehicles from China to UAE buyers through our secure marketplace platform.",
};

export default function page() {
  return (
    <main>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-4 text-[#202C4A]">
             {data.title}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {data.subTitle}
            </p>
          </div>
          <SellerOnboard />
        </div>
      </div>
    </main>
  );
}