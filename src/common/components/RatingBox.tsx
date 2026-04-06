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
    <div className='flex gap-2'>
      {ratingValues.map((ratingValue) => {
        return (
          <div
            key={ratingValue}
            className={classNames(
              'bg-gray-100 text-lg font-semibold rounded-xl w-[40px] aspect-square flex justify-center items-center cursor-pointer',
              {
                'bg-primary text-white': isHighlighting(ratingValue),
                'hover:bg-gray-200': !isHighlighting(ratingValue),
              },
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
