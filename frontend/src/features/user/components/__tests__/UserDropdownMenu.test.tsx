import userEvent from "@testing-library/user-event";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { localStorageMock } from "../../../../mocks/storageMocks";
import { render, within } from "../../../common/utils/test-utils";
import { UserDropdownMenu } from "../UserDropdownMenu";

describe("UserDropdownMenu", () => {
  function renderUserDropdown() {
    window.history.replaceState({}, "", "/");
    const portal = document.createElement("div");
    portal.classList.add("portal");
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserDropdownMenu />}>
            <Route path="login" element={<div>Login Page</div>} />
            <Route path="profile" element={<div>Profile page</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, queryByRole, findByRole, getAllByRole } = render(
      Component,
      {
        preloadedState: {
          user: {
            user: {
              id: 1,
              email: "tester@gmail.com",
              nickname: "tester",
            },
            accessToken: "accessToken",
            refreshToken: "refreshToken",
          },
        },
        container: document.body.appendChild(portal),
      }
    );

    return {
      getByRole,
      queryByRole,
      getAllByRole,
      findByRole,
    };
  }

  it("처음에 메뉴는 렌더링되지 않고, `회원 관련 메뉴` 버튼만 렌더링된다.", () => {
    const { getByRole, queryByRole } = renderUserDropdown();

    const userButton = getByRole("button", { name: "회원 관련 메뉴" });
    const menu = queryByRole("menu");

    expect(userButton).toBeInTheDocument();
    expect(menu).toBeNull();
  });

  it("`회원 관련 메뉴` 버튼을 클릭하면 메뉴 아이템들이 렌더링된다.", async () => {
    const { getByRole, getAllByRole, findByRole } = renderUserDropdown();

    const userButton = getByRole("button", { name: "회원 관련 메뉴" });

    userEvent.click(userButton);

    const menu = await findByRole("menu");
    const profileLink = within(menu).getByRole("menuitem", {
      name: "내 프로필",
    });
    const deleteAccountButton = within(menu).getByRole("menuitem", {
      name: "회원 탈퇴",
    });
    const logoutButton = within(menu).getByRole("menuitem", {
      name: "로그아웃",
    });

    expect(menu.childElementCount).toBe(3);
    expect(profileLink).toBeInTheDocument();
    expect(deleteAccountButton).toBeInTheDocument();
    expect(logoutButton).toBeInTheDocument();
  });

  it("메뉴 아이템 중 `내 프로필` 링크를 클릭하면 `/profile` url로 이동한다.", async () => {
    const { getByRole, findByRole } = renderUserDropdown();
    const userButton = getByRole("button", { name: "회원 관련 메뉴" });
    userEvent.click(userButton);

    const menu = await findByRole("menu");
    const profileLink = within(menu).getByRole("menuitem", {
      name: "내 프로필",
    });

    userEvent.click(profileLink);

    expect(window.location.pathname).toBe("/profile");
  });

  it("메뉴 아이템 중 `회원 탈퇴` 버튼을 클릭하면 회원 탈퇴 Modal을 띄운다.", async () => {
    const { getByRole, findByRole } = renderUserDropdown();
    const userButton = getByRole("button", { name: "회원 관련 메뉴" });
    userEvent.click(userButton);

    const menu = await findByRole("menu");
    const deleteAccoountButton = within(menu).getByRole("menuitem", {
      name: "회원 탈퇴",
    });

    userEvent.click(deleteAccoountButton);

    const deleteAccountModal = getByRole("dialog");

    expect(deleteAccountModal).toHaveTextContent(/회원 탈퇴/g);
  });

  it("메뉴 아이템 중 `로그아웃` 버튼을 누르면 localStorage의 accessToken, refreshToken을 삭제하고 `/login` url로 이동한다.", async () => {
    const localStorageRemoveItemSpy = jest.spyOn(
      localStorageMock,
      "removeItem"
    );
    const { getByRole, findByRole } = renderUserDropdown();
    const userButton = getByRole("button", { name: "회원 관련 메뉴" });
    userEvent.click(userButton);

    const menu = await findByRole("menu");
    const logoutButton = within(menu).getByRole("menuitem", {
      name: "로그아웃",
    });

    userEvent.click(logoutButton);

    expect(localStorageRemoveItemSpy).toBeCalledWith("accessToken");
    expect(localStorageRemoveItemSpy).toBeCalledWith("refreshToken");
    expect(window.location.pathname).toBe("/login");
  });
});
