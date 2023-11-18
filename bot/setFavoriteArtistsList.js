import {
  getCheckUser,
  getUserFavoriteArtists,
  postAddUser,
} from "./connectDB.js";

export const setFavoriteArtistsList = async (userId) => {
  const isUsrExist = await getCheckUser(userId);
  if (!isUsrExist.userExists) {
    await postAddUser(userId, 1, msg.from.first_name, "all");
  } else {
    const userArtists = await getUserFavoriteArtists(userId);
    return (
      userArtists?.userData?.map((el) => {
        return el.artistName;
      }) ?? []
    );
  }
};
