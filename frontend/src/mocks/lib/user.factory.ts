import {
  SignUpRequest,
  SignUpResponse,
  UpdateUserRequest,
} from "features/api/types";

const users: Array<SignUpResponse> = [
  {
    email: "tester@gmail.com",
    nickname: "tester",
    id: 1,
    accessToken: "accessToken1",
    refreshToken: "refreshToken1",
  },
  {
    email: "dev@gmail.com",
    nickname: "dev",
    id: 2,
    accessToken: "accessToken2",
    refreshToken: "refreshToken2",
  },
  {
    email: "voca@gmail.com",
    nickname: "voca",
    id: 3,
    accessToken: "accessToken3",
    refreshToken: "refreshToken3",
  },
];

export function getInitialUsers(): Array<SignUpResponse> {
  return users;
}

function registerUser(users: Array<SignUpResponse>, signUpDto: SignUpRequest) {
  const id = users[users.length - 1].id + 1;
  const { signUpAuthCode, password, ...rest } = signUpDto;
  return users.concat({
    id,
    accessToken: `accessToken${id}`,
    refreshToken: `refreshToken${id}`,
    ...rest,
  });
}

function unregisterUser(users: Array<SignUpResponse>, idToUnregister: number) {
  const newUsers = [...users];
  const userIndex = users.findIndex((user) => user.id === idToUnregister);

  if (userIndex !== -1) {
    newUsers.splice(userIndex, 1);
    return newUsers;
  }

  return newUsers;
}

export function updateUser(
  users: Array<SignUpResponse>,
  updateUserDto: UpdateUserRequest
) {
  const newUsers = [...users];
  let userIndex = newUsers.findIndex(
    (user) => user.email === updateUserDto.email
  );
  if (userIndex !== -1) {
    const { newNickname, newPassword } = updateUserDto;
    newUsers[userIndex] = {
      ...newUsers[userIndex],
      ...(newNickname && { nickname: newNickname }),
      ...(newPassword && { password: newPassword }),
    };
  }

  return {
    newUsers,
    updatedUser: newUsers[userIndex],
  };
}

export { users, registerUser, unregisterUser };
