"use client";

export type OwnerTab = "ngayon" | "natira" | "bukas";

export function OwnerBottomNav({
  activeTab,
  onSelectTab,
}: {
  activeTab: OwnerTab;
  onSelectTab: (tab: OwnerTab) => void;
}) {
  return (
    <nav className="owner-figma-nav" aria-label="Owner navigation">
      <button
        type="button"
        className={`owner-figma-tab ${activeTab === "ngayon" ? "active" : ""}`}
        onClick={() => onSelectTab("ngayon")}
        aria-label="Ngayon"
        aria-current={activeTab === "ngayon" ? "page" : undefined}
      >
        <svg
          className="owner-figma-ico"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15 20.999V12.999C15 12.7338 14.8946 12.4795 14.7071 12.2919C14.5196 12.1044 14.2652 11.999 14 11.999H10C9.73478 11.999 9.48043 12.1044 9.29289 12.2919C9.10536 12.4795 9 12.7338 9 12.999V20.999M3 9.9995C2.99993 9.70857 3.06333 9.42113 3.18579 9.15722C3.30824 8.89331 3.4868 8.6593 3.709 8.4715L10.709 2.4715C11.07 2.16641 11.5274 1.99902 12 1.99902C12.4726 1.99902 12.93 2.16641 13.291 2.4715L20.291 8.4715C20.5132 8.6593 20.6918 8.89331 20.8142 9.15722C20.9367 9.42113 21.0001 9.70857 21 9.9995V18.9995C21 19.5299 20.7893 20.0386 20.4142 20.4137C20.0391 20.7888 19.5304 20.9995 19 20.9995H5C4.46957 20.9995 3.96086 20.7888 3.58579 20.4137C3.21071 20.0386 3 19.5299 3 18.9995V9.9995Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <span className="owner-figma-lbl">Ngayon</span>
      </button>

      <button
        type="button"
        className={`owner-figma-tab ${activeTab === "natira" ? "active" : ""}`}
        onClick={() => onSelectTab("natira")}
        aria-label="Natira"
        aria-current={activeTab === "natira" ? "page" : undefined}
      >
        <svg
          className="owner-figma-ico"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 1.99902V8.99958C3 10.0997 3.9 10.9997 5 10.9997H7M7 10.9997H9C9.53043 10.9997 10.0391 10.789 10.4142 10.4139C10.7893 10.0388 11 9.53006 11 8.99958V1.99902M7 10.9997V1.99902M7 10.9997V22.0006M21 15.0001V1.99902C19.6739 1.99902 18.4021 2.52585 17.4645 3.46361C16.5268 4.40136 16 5.67323 16 6.99942V12.9999C16 14.1 16.9 15.0001 18 15.0001H21ZM21 15.0001V22.0006"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <span className="owner-figma-lbl">Natira</span>
      </button>

      <button
        type="button"
        className={`owner-figma-tab ${activeTab === "bukas" ? "active" : ""}`}
        onClick={() => onSelectTab("bukas")}
        aria-label="Bukas"
        aria-current={activeTab === "bukas" ? "page" : undefined}
      >
        <svg
          className="owner-figma-ico"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12.0001 1.99902V9.99966M16.0004 5.99934L12.0001 1.99902L7.99975 5.99934M4.92919 10.9294L6.3393 12.3395M1.99927 18.0003H3.99943M20.0007 18.0003H22.0009M19.0708 10.9294L17.6607 12.3395M22.0009 22.0006H1.99927M16.0004 18.0003C16.0004 16.9394 15.5789 15.9219 14.8287 15.1716C14.0785 14.4214 13.061 14 12.0001 14C10.9391 14 9.92162 14.4214 9.17141 15.1716C8.42121 15.9219 7.99975 16.9394 7.99975 18.0003"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <span className="owner-figma-lbl">Bukas</span>
      </button>
    </nav>
  );
}
