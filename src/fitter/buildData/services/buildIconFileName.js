module.exports = function buildIconFileName(type, props) {
  if (!type || !type.iconID) return undefined;

  const iconID = type.iconID;
  const iconFilePath = props.iconIDs[iconID].iconFile;
  const dividedIconFilePath = iconFilePath.split("/");
  const iconFile = dividedIconFilePath[dividedIconFilePath.length - 1];

  return iconFile;
};
