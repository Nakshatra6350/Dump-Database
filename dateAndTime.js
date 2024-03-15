const getFolderPath = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const dateFolderName = `${year}-${month}-${day}`;
  const time = `${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}`;
  const folderPath = `${time}`;

  return folderPath;
};

module.exports = getFolderPath;