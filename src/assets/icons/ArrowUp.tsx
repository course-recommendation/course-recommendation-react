import * as React from "react";
const ArrowUp = ({ filled, ...props }: React.SVGProps<SVGSVGElement> & { filled?: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#1f1f1f"
        {...props}
    >
        {filled ? (
            <path d="M320-120v-240H120l360-440 360 440H640v240H320Z" />
        ) : (
            <path d="M320-120v-240H120l360-440 360 440H640v240H320Zm80-80h160v-240h111L480-674 289-440h111v240Zm80-240Z" />
        )}
    </svg>
);
export default ArrowUp;
