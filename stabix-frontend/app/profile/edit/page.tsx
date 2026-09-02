"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import AppPopup from "@/components/AppPopup";

type Profile = {
  stbx_uid?: string;
  username?: string;
  email?: string | null;
  eoa_address?: string | null;
  profile_image?: string | null;
  profileImage?: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [eoaAddress, setEoaAddress] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);

  const [savingUsername, setSavingUsername] = useState(false);
  const [savingEoa, setSavingEoa] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const showpopup = (message: string) => {
    setPopupMessage(message);
    setPopupOpen(true);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!imageViewerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setImageViewerOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageViewerOpen]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const stbxUid = localStorage.getItem("stbx_uid");

      if (!stbxUid) {
        console.error("StabiX UID not found");
        return;
      }

      const data = await apiFetch(`/api/users/profile/${stbxUid}`);

      if (data?.user) {
        const user = data.user;

        setProfile(user);
        setUsername(user.username || "");
        setEoaAddress(user.eoa_address || "");
        setProfileImage(
          user.profile_image || user.profileImage || null
        );
      }
    } catch (error) {
      console.error("Edit profile API error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showpopup("Only JPG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showpopup("Profile image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("profile_image", file);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("jwt_token")
          : null;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(
        `${API_URL}/api/users/profile-image`,
        {
          method: "POST",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
          body: formData,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || `API Error: ${response.status}`
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message || "Profile image update failed."
        );
      }

      setProfileImage(data.profile_image || null);

      showpopup("Profile image updated successfully.");

      await loadProfile();
    } catch (error) {
      console.error("Profile image upload error:", error);

      showpopup(
        error instanceof Error
          ? error.message
          : "Profile image update failed."
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!profileImage) {
      showpopup("No profile image to remove.");
      return;
    }

    try {
      setRemovingImage(true);

      const data = await apiFetch("/api/users/profile-image", {
        method: "DELETE",
      });

      if (!data?.success) {
        throw new Error(
          data?.message || "Profile image removal failed."
        );
      }

      setProfileImage(null);

      showpopup("Profile image removed successfully.");

      await loadProfile();
    } catch (error) {
      console.error("Profile image removal error:", error);

      showpopup(
        error instanceof Error
          ? error.message
          : "Profile image removal failed."
      );
    } finally {
      setRemovingImage(false);
    }
  };

  const saveUsername = async () => {
    const trimmedUsername = username.trim();

    // Blank
    if (!trimmedUsername) {
      showpopup("Username is required.");
      return;
    }

    // Username format
    // Letters, numbers and underscore only
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      showpopup("Invalid username.");
      return;
    }

    // Same username
    if (
      profile?.username &&
      trimmedUsername.toLowerCase() ===
        profile.username.trim().toLowerCase()
    ) {
      showpopup("Username already used.");
      return;
    }

    try {
      setSavingUsername(true);

      const data = await apiFetch("/api/users/username", {
        method: "PATCH",
        body: JSON.stringify({
          new_username: trimmedUsername,
        }),
      });

      if (!data?.success) {
        throw new Error(
          data?.message || "Username update failed."
        );
      }

      showpopup("Username updated successfully.");

      await loadProfile();
    } catch (error) {
      console.error("Username update error:", error);

      showpopup(
        error instanceof Error
          ? error.message
          : "Username update failed."
      );
    } finally {
      setSavingUsername(false);
    }
  };

  const saveEoaAddress = async () => {
    const trimmedAddress = eoaAddress.trim();
    const currentAddress = (profile?.eoa_address || "").trim();

    // Blank
    if (!trimmedAddress) {
      showpopup("Wallet address is required.");
      return;
    }

    // Exact EOA wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      showpopup("Invalid wallet address.");
      return;
    }

    // Same address already saved
    if (
      currentAddress &&
      trimmedAddress.toLowerCase() ===
        currentAddress.toLowerCase()
    ) {
      showpopup("Wallet address already linked.");
      return;
    }

    try {
      setSavingEoa(true);

      const data = await apiFetch("/api/users/eoa-address", {
        method: "PATCH",
        body: JSON.stringify({
          eoa_address: trimmedAddress,
        }),
      });

      if (!data?.success) {
        throw new Error(
          data?.message || "Wallet address update failed."
        );
      }

      showpopup("Wallet address updated successfully.");

      await loadProfile();
    } catch (error) {
      console.error("Wallet address update error:", error);

      showpopup(
        error instanceof Error
          ? error.message
          : "Wallet address update failed."
      );
    } finally {
      setSavingEoa(false);
    }
  };

  const firstLetter =
    profile?.username?.trim()?.charAt(0)?.toUpperCase() || "?";

  const profileImageUrl = profileImage
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")}${profileImage}`
    : null;

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 pb-20 text-slate-900 dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto w-full max-w-md">

        {/* Header */}
        <header className="flex items-center gap-3 py-6">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full text-3xl transition active:scale-90"
          >
            ←
          </button>

          <h1 className="text-[26px] font-bold tracking-tight">
            Edit Profile
          </h1>
        </header>

        {loading ? (
          <div className="mt-16 text-center text-slate-400">
            Loading profile...
          </div>
        ) : (
          <>
            {/* Profile Image */}
            <section className="mt-8 flex flex-col items-center">
              <div className="relative">
                {profileImage ? (
                  <button
                    type="button"
                    onClick={() => setImageViewerOpen(true)}
                    aria-label="View profile picture"
                    className="block rounded-full transition active:scale-95"
                  >
                    <img
                      src={profileImageUrl || ""}
                      alt="Profile"
                      className="h-28 w-28 rounded-full object-cover shadow-lg"
                    />
                  </button>
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-200 text-5xl font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {firstLetter}
                  </div>
                )}

                {/* Camera */}
                <button
                  type="button"
                  onClick={handleCameraClick}
                  disabled={uploadingImage}
                  aria-label="Change profile photo"
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition active:scale-90 disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <span className="text-sm font-bold">
                      …
                    </span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3l-1.5-2Z" />
                      <circle cx="12" cy="12" r="3.5" />
                    </svg>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <p className="mt-4 text-sm text-slate-400">
                Profile photo can be changed once every 7 days
              </p>

              {profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={
                    removingImage || uploadingImage
                  }
                  className="mt-3 rounded-xl px-4 py-2 text-sm font-semibold text-red-500 transition active:scale-95 disabled:opacity-50"
                >
                  {removingImage
                    ? "Removing..."
                    : "Remove Profile Photo"}
                </button>
              )}
            </section>

            {/* Username */}
            <section className="mt-10">
              <label className="mb-2 block text-sm font-medium text-slate-500 dark:text-slate-400">
                Username
              </label>

              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#151518]">
                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  className="w-full bg-transparent text-[17px] font-medium outline-none"
                  placeholder="Username"
                />
              </div>

              <p className="mt-2 px-1 text-xs text-slate-400">
                Username can be changed once every 90 days.
              </p>

              <button
                type="button"
                onClick={saveUsername}
                disabled={savingUsername}
                className="mt-3 w-full rounded-2xl bg-black py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {savingUsername
                  ? "Saving..."
                  : "Save Username"}
              </button>
            </section>

            {/* EOA */}
            <section className="mt-8">
              <label className="mb-2 block text-sm font-medium text-slate-500 dark:text-slate-400">
                EOA Address
              </label>

              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#151518]">
                <textarea
                  value={eoaAddress}
                  onChange={(e) =>
                    setEoaAddress(e.target.value)
                  }
                  rows={3}
                  className="w-full resize-none bg-transparent text-[15px] font-medium outline-none"
                  placeholder="Enter EOA Address"
                />
              </div>

              <button
                type="button"
                onClick={saveEoaAddress}
                disabled={savingEoa}
                className="mt-3 w-full rounded-2xl bg-black py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {savingEoa
                  ? "Saving..."
                  : "Save EOA Address"}
              </button>
            </section>
          </>
        )}
      </div>

      {/* PROFILE IMAGE VIEWER */}

      {imageViewerOpen && profileImageUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-4 py-8"
          onClick={() => setImageViewerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Profile picture"
        >
          <div
            className="flex max-h-full max-w-full items-center justify-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={profileImageUrl}
              alt="Profile"
              className="max-h-[90vh] max-w-[94vw] object-contain select-none"
              draggable={false}
            />
          </div>
        </div>
      )}

      <AppPopup
        open={popupOpen}
        message={popupMessage}
        onClose={() => setPopupOpen(false)}
      />
    </main>
  );
}