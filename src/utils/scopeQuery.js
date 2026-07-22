export function buildScopeQuery(user, selectedClass = null) {
  const query = { school: user.school };

  const targetClass = selectedClass || user.class;

  if (targetClass) {
    query.$or = [
      { targetClasses: targetClass },  // targets this specific class
      { targetClasses: { $size: 0 } }, // OR school-wide (empty array)
    ];
  }

  return query;
}