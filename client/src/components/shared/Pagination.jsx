import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

const Pagination = ({ page, totalPages, totalItems, onPageChange }) => {
    return (
        <div className="flex flex-row items-center justify-between w-full gap-2 mb-4">
            <div className="text-gray-600 font-semibold text-md">
                Showing page {page} of {totalPages} — Total: {totalItems}
            </div>
            <div className="flex gap-2">
                <Button
                    className={`px-3 py-1 rounded-2xl disabled:opacity-50 ${page > 1 ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ArrowLeft /> Previous
                </Button>

                <span className="px-3 py-1">
                    {page} / {totalPages}
                </span>

                <Button
                    className={`px-3 py-1 rounded-2xl disabled:opacity-50 ${page < totalPages ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next <ArrowRight />
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
