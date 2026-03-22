export function useAttributeValueToLabel() {
  const map: Record<string, string> = {
    theory: "Lý thuyết",
  };

  return (value: string): string => {
    return map[value] ?? value;
  };
}
