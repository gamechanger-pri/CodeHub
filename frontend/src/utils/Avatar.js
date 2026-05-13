export function stringToHash(string) {
  let hash = 0;
  if (!string) return hash;

  // Generate hash value from string
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash);
}

function stringToColor(string) {
  const hash = stringToHash(string);

  let color = "#";

  // Convert hash to RGB color
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

export function stringAvatar(name) {
  // Handle empty name safely
  if (!name) {
    return {
      sx: {
        bgcolor: "rgba(255,255,255,0.8)",
      },
      children: "",
    };
  }

  const splitName = name.split(" ");

  const firstLetter = splitName[0][0];

  const secondLetter = splitName[1]
    ? splitName[1][0]
    : "";

  return {
    sx: {
      bgcolor: stringToColor(name),
    },

    children: `${firstLetter}${secondLetter}`,
  };
}