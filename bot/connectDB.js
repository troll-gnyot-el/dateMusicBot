import fetch from "node-fetch";
export const getCheckUser = async (userId) => {
  return await fetch(`http://localhost:3000/checkUser/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP getCheckUser error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Get getCheckUser created:", data);
      return data;
    })
    .catch((error) => {
      console.error("Fetch getCheckUser error:", error);
      return {};
    });
};

export const getUserFavoriteArtists = async (userId) => {
  return await fetch(`http://localhost:3000/getUserFavoriteArtists/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `HTTP getUserFavoriteArtists error! Status: ${response.status}`
        );
      }
      return response.json();
    })
    .then((data) => {
      console.log("Get getUserFavoriteArtists created:", data);
      return data
    })
    .catch((error) => {
      console.error("Fetch getUserFavoriteArtists error:", error);
      return {};
    });
};

export const postUserFavoriteArtists = async (usr, artist) => {
  fetch("http://localhost:3000/saveData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ usr, artist }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `HTTP postUserFavoriteArtists error! Status: ${response.status}`
        );
      }
      console.log('response', response)
      return response.json();
    })
    .then((data) => {
      console.log("Post postUserFavoriteArtists created:", data);
      return data;
    })
    .catch((error) => {
      console.error("Fetch postUserFavoriteArtists error:", error);
      return 0
    });
};

export const postAddUser = async (id, searchResolving, name, gender) => {
  fetch("http://localhost:3000/addUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, name, gender, searchResolving }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP postAddUser error! Status: ${response.status}`);
      }
      console.log('postAddUser', postAddUser)
      return response.json();
    })
    .then((data) => {
      console.log("Post postAddUser created:", data);
      return data;
    })
    .catch((error) => {
      console.error("Fetch postAddUser error:", error);
      return 0
    });
};

export const postUserSearchResolving = async (searchResolving) => {
  fetch("http://localhost:3000/searchResolving", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ searchResolving }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Post created:", data);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
};
