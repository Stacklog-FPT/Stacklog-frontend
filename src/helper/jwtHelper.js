const isTokenExpired = (tokenPayload) => {
  if (!tokenPayload?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return tokenPayload.exp < currentTime;
};
