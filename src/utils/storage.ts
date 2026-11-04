export const getStoredItem = (keySuffix: string): string | null => {
  const newKey = `toolspeed_${keySuffix}`;
  const oldKey = `drehspeed_${keySuffix}`;
  return localStorage.getItem(newKey) ?? localStorage.getItem(oldKey);
};

export const setStoredItem = (keySuffix: string, value: string): void => {
  const newKey = `toolspeed_${keySuffix}`;
  localStorage.setItem(newKey, value);
};

export const removeStoredItem = (keySuffix: string): void => {
  const newKey = `toolspeed_${keySuffix}`;
  const oldKey = `drehspeed_${keySuffix}`;
  localStorage.removeItem(newKey);
  localStorage.removeItem(oldKey);
};
