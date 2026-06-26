import classNames from 'classnames';
import { useState } from 'react';

type Props = {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  highlightSmallerValues?: boolean;
};

export default function RatingBox({
  value,
  defaultValue = 0,
  onChange,
  highlightSmallerValues,
}: Props) {
  const ratingValues = [1, 2, 3, 4, 5];

  const [internalValue, setInternalValue] = useState(defaultValue);

  const currentValue = value !== undefined ? value : internalValue;

  function isHighlighting(inputValue: number) {
    if (highlightSmallerValues) {
      return inputValue <= currentValue;
    }
    return inputValue === currentValue;
  }

  function handleClick(ratingValue: number) {
    if (value === undefined) {
      setInternalValue(ratingValue);
    }

    onChange?.(ratingValue);
  }

  return (
    <div className='flex gap-1.5'>
      {ratingValues.map((ratingValue) => {
        const active = isHighlighting(ratingValue);
        return (
          <div
            key={ratingValue}
            className={classNames(
              'w-8 h-8 rounded-lg flex justify-center items-center cursor-pointer text-sm font-semibold select-none transition-all duration-150',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'bg-stone-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-700',
            )}
            onClick={() => handleClick(ratingValue)}
          >
            {ratingValue}
          </div>
        );
      })}
    </div>
  );
}
