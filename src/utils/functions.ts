export const getUserTitle = ({username, first_name, last_name}: {username?: string, first_name?: string, last_name?: string}) => {
  if (first_name || last_name) {
    const name = `${first_name} ${last_name}`;
    return name.trim();
  }
  if (username) {
    return username;
  }
  return '';
};
