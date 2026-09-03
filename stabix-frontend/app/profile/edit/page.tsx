"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cropper, { Area } from "react-easy-crop";
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

  // Crop states
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);

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

  useEffect(() => {
    if (!cropOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCropper();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [cropOpen]);

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

  event.target.value = "";

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    showpopup(
      "Only JPG, PNG and WebP images are allowed."
    );
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showpopup(
      "Image size must be 5 MB or less."
    );
    return;
  }

  try {
    setUploadingImage(true);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jwt_token")
        : null;

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "";

    const formData = new FormData();

    formData.append(
      "profile_image",
      file,
      file.name
    );

    const response = await fetch(
      `${API_URL}/api/users/profile-image/check`,
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
  showpopup(
    data?.message ||
      "Unable to check the image. Please try again."
  );
  return;
}

if (!data?.allowed) {
  showpopup(
    "Explicit or inappropriate images are not allowed."
  );
  return;
}

    const imageUrl = URL.createObjectURL(file);

    setCropImage(imageUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropOpen(true);

  } catch (error) {
    console.error(
      "Profile image check error:",
      error
    );

    showpopup(
      "Unable to check the image. Please try again."
    );
  } finally {
    setUploadingImage(false);
  }
};

  const onCropComplete = (
    _: Area,
    croppedAreaPixels: Area
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const closeCropper = () => {
    if (cropImage) {
      URL.revokeObjectURL(cropImage);
    }

    setCropOpen(false);
    setCropImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const createCroppedImage = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = new Image();

    image.src = imageSrc;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Unable to load image."));
    });

    const canvas = document.createElement("canvas");

    const size = Math.min(
      pixelCrop.width,
      pixelCrop.height
    );

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Unable to process image.");
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      size,
      size,
      0,
      0,
      size,
      size
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error("Unable to create cropped image.")
            );
          }
        },
        "image/jpeg",
        0.92
      );
    });
  };

  const handleCropDone = async () => {
    if (!cropImage || !croppedAreaPixels) {
      showpopup("Please adjust the image first.");
      return;
    }

    try {
      setUploadingImage(true);

      const croppedBlob = await createCroppedImage(
        cropImage,
        croppedAreaPixels
      );

      const formData = new FormData();

      formData.append(
        "profile_image",
        croppedBlob,
        "profile-image.jpg"
      );

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
          data?.message ||
            "Profile image update failed."
        );
      }

      setProfileImage(data.profile_image || null);

      closeCropper();

      showpopup(
        "Profile image updated successfully."
      );

      await loadProfile();
    } catch (error) {
      console.error(
        "Profile image upload error:",
        error
      );

      showpopup(
        error instanceof Error
          ? error.message
          : "Profile image update failed."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!profileImage) {
      showpopup("No profile image to remove.");
      return;
    }

    try {
      setRemovingImage(true);

      const data = await apiFetch(
        "/api/users/profile-image",
        {
          method: "DELETE",
        }
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Profile image removal failed."
        );
      }

      setProfileImage(null);

      showpopup(
        "Profile image removed successfully."
      );

      await loadProfile();
    } catch (error) {
      console.error(
        "Profile image removal error:",
        error
      );

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

      const data = await apiFetch(
        "/api/users/username",
        {
          method: "PATCH",
          body: JSON.stringify({
            new_username: trimmedUsername,
          }),
        }
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Username update failed."
        );
      }

      showpopup(
        "Username updated successfully."
      );

      await loadProfile();
    } catch (error) {
      console.error(
        "Username update error:",
        error
      );

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
    const currentAddress = (
      profile?.eoa_address || ""
    ).trim();

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
      showpopup(
        "Wallet address already linked."
      );
      return;
    }

    try {
      setSavingEoa(true);

      const data = await apiFetch(
        "/api/users/eoa-address",
        {
          method: "PATCH",
          body: JSON.stringify({
            eoa_address: trimmedAddress,
          }),
        }
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Wallet address update failed."
        );
      }

      showpopup(
        "Wallet address updated successfully."
      );

      await loadProfile();
    } catch (error) {
      console.error(
        "Wallet address update error:",
        error
      );

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
    profile?.username
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "?";

  const profileImageUrl = profileImage
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace(
        /\/$/,
        ""
      )}${profileImage}`
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
                    onClick={() =>
                      setImageViewerOpen(true)
                    }
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
                  disabled={
                    uploadingImage ||
                    removingImage ||
                    cropOpen
                  }
                  aria-label="Change profile photo"
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition active:scale-90 disabled:opacity-50"
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
                      <circle
                        cx="12"
                        cy="12"
                        r="3.5"
                      />
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
                    removingImage ||
                    uploadingImage ||
                    cropOpen
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
                Wallet Address
              </label>

              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#151518]">
                <textarea
                  value={eoaAddress}
                  onChange={(e) =>
                    setEoaAddress(e.target.value)
                  }
                  rows={1}
                  className="w-full resize-none bg-transparent text-[15px] font-medium outline-none"                
                  placeholder="Enter Wallet Address"
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
                  : "Save Wallet Address"}
              </button>
            </section>
          </>
        )}
      </div>

      {/* CROP MODAL */}

      {cropOpen && cropImage && (
        <div className="fixed inset-0 z-[10000] bg-black">
          <div className="relative h-full w-full">

            {/* Crop area */}
            <div className="absolute inset-x-0 bottom-32 top-0">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-black px-6 pb-8 pt-5 text-white">

              <div className="mb-5 flex items-center gap-3">
                <span className="text-sm text-white/70">
                  Zoom
                </span>

                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(event) =>
                    setZoom(Number(event.target.value))
                  }
                  className="flex-1"
                  aria-label="Zoom"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeCropper}
                  disabled={uploadingImage}
                  className="flex-1 rounded-2xl bg-white/10 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
  type="button"
  onClick={handleCropDone}
  disabled={uploadingImage}
  className="flex-1 rounded-2xl bg-white py-3.5 text-sm font-semibold text-black transition active:scale-[0.98] disabled:opacity-50"
>
  {uploadingImage
    ? "Uploading..."
    : "Done"}
</button>
</div>
</div>
</div>
</div>
)}

{/* PROFILE IMAGE VIEWER */}

{imageViewerOpen && profileImageUrl && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-4 py-8"
    onClick={() =>
      setImageViewerOpen(false)
    }
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