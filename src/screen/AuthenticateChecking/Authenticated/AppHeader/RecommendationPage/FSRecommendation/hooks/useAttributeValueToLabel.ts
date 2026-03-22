export function useAttributeValueToLabel() {
  const map: Record<string, string> = {
    theory: 'Lý thuyết',
    instructor: 'Giảng viên',
    homework: 'Bài tập về nhà',
    material: 'Tài liệu',
    exam: 'Kiểm tra',
    workload: 'Khối lượng môn học',
    difficulty: 'Độ khó',
  };

  return (value: string): string => {
    return map[value] ?? value;
  };
}
