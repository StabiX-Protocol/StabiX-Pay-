"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Transaction = {
  STRId: string;
  type: "sent" | "received" | "deposit" | "withdraw";
  counterparty?: string | null;
  created_at: string;
};

type User = {
  stbx_uid?: string;
  username?: string;
  profile_image?: string | null;
  profileImage?: string | null;
};

type Person = {
  uid: string;
  username: string;
  profileImage: string | null;
  latestType: Transaction["type"];
  latestTime: string;
  latestSTRId: string;
};

const INITIAL_VISIBLE = 7;

export default function People() {
  const router = useRouter();

  const [people, setPeople] = useState<Person[]>([]);
  const [expanded, setExpanded] = useState(false);

  /*
   * Stores SEEN transaction STR IDs.
   *
   * Important:
   * We store STRId, NOT UID.
   *
   * This means an old transaction can never
   * make the green dot appear again.
   */

  const [seenTransactions, setSeenTransactions] =
    useState<string[]>([]);

  /*
   * LOAD SEEN TRANSACTIONS
   */

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(
        "stabix-people-seen-transactions"
      );

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setSeenTransactions(parsed);
      }
    } catch (error) {
      console.error(
        "People seen transaction load error:",
        error
      );
    }
  }, []);

  /*
   * LOAD PEOPLE
   */

  useEffect(() => {
    async function loadPeople() {
      try {
        const data = await apiFetch(
          "/api/transactions/history"
        );

        const transactions: Transaction[] =
          data?.transactions || [];

        /*
         * Only person-to-person transactions.
         */

        const personTransactions =
          transactions
            .filter(
              (transaction) =>
                (transaction.type === "sent" ||
                  transaction.type === "received") &&
                transaction.counterparty
            )
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );

        /*
         * Latest transaction for each person.
         */

        const latestByUser = new Map<
          string,
          Transaction
        >();

        for (const transaction of personTransactions) {
          const uid =
            transaction.counterparty!.trim();

          if (!latestByUser.has(uid)) {
            latestByUser.set(uid, transaction);
          }
        }

        const latestPeople = Array.from(
          latestByUser.entries()
        );

        /*
         * Fetch real profiles.
         */

        const profiles = await Promise.all(
          latestPeople.map(
            async ([uid, transaction]) => {
              try {
                const userData = await apiFetch(
                  `/api/users/${encodeURIComponent(uid)}`
                );

                const user: User =
                  userData?.user || userData;

                return {
                  uid,
                  username:
                    user?.username || uid,
                  profileImage:
                    user?.profile_image ||
                    user?.profileImage ||
                    null,
                  latestType:
                    transaction.type,
                  latestTime:
                    transaction.created_at,
                  latestSTRId:
                    transaction.STRId,
                } satisfies Person;
              } catch (error) {
                console.error(
                  `Profile fetch failed for ${uid}:`,
                  error
                );

                return {
                  uid,
                  username: uid,
                  profileImage: null,
                  latestType:
                    transaction.type,
                  latestTime:
                    transaction.created_at,
                  latestSTRId:
                    transaction.STRId,
                } satisfies Person;
              }
            }
          )
        );

        setPeople(profiles);
      } catch (error) {
        console.error(
          "People transaction load error:",
          error
        );

        setPeople([]);
      }
    }

    loadPeople();
  }, []);

  /*
   * VISIBLE PEOPLE
   */

  const visiblePeople = expanded
    ? people
    : people.slice(0, INITIAL_VISIBLE);

  const hasMore =
    people.length > INITIAL_VISIBLE;

  /*
   * PROFILE IMAGE URL
   */

  const getProfileImageUrl = (
    profileImage: string | null
  ) => {
    if (!profileImage) {
      return null;
    }

    if (
      profileImage.startsWith("http://") ||
      profileImage.startsWith("https://")
    ) {
      return profileImage;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(
        /\/$/,
        ""
      ) || "";

    return `${baseUrl}${profileImage}`;
  };

  /*
   * SHORT UID
   */

  const getShortUid = (uid: string) => {
    if (uid.length <= 10) {
      return uid;
    }

    return `${uid.slice(0, 9)}...`;
  };

  /*
   * MARK THIS TRANSACTION AS SEEN
   */

  const markTransactionSeen = (
    strId: string
  ) => {
    if (!strId) return;

    setSeenTransactions((current) => {
      if (current.includes(strId)) {
        return current;
      }

      const next = [
        ...current,
        strId,
      ];

      try {
        sessionStorage.setItem(
          "stabix-people-seen-transactions",
          JSON.stringify(next)
        );
      } catch (error) {
        console.error(
          "People seen transaction save error:",
          error
        );
      }

      return next;
    });
  };

  /*
   * OPEN USER
   */

  const openPerson = (person: Person) => {
    /*
     * IMPORTANT:
     * Mark the CURRENT latest transaction as seen
     * before navigating away.
     */

    markTransactionSeen(
      person.latestSTRId
    );

    router.push(
      `/user/${encodeURIComponent(
        person.uid
      )}?from=home`
    );
  };

  /*
   * NO PEOPLE
   */

  if (people.length === 0) {
    return null;
  }

  return (
    <section className="px-5 pt-7">

      {/* TITLE */}

      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight">
          People
        </h2>
      </div>

      {/* PEOPLE */}

      <div
        className="grid gap-x-3 gap-y-6"
        style={{
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        }}
      >

        {visiblePeople.map((person) => {
          const profileImageUrl =
            getProfileImageUrl(
              person.profileImage
            );

          const firstLetter =
            person.username
              .trim()
              .charAt(0)
              .toUpperCase() || "S";

          /*
           * GREEN DOT:
           *
           * Only if:
           * 1. Latest transaction is RECEIVED
           * 2. Its STRId has NOT been seen
           */

          const showGreenDot =
            person.latestType === "received" &&
            !seenTransactions.includes(
              person.latestSTRId
            );

          return (
            <button
              key={person.uid}
              type="button"
              onClick={() =>
                openPerson(person)
              }
              className="flex min-w-0 flex-col items-center text-center transition active:scale-95"
            >

              {/* PROFILE */}

              <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center">

                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={person.username}
                    className="h-[68px] w-[68px] rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10"
                  />
                ) : (
                  <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white ring-1 ring-slate-200 dark:ring-white/10">
                    {firstLetter}
                  </div>
                )}

                {/* NEW TRANSACTION DOT */}

                {showGreenDot && (
                  <span
                    aria-label="New received transaction"
                    className="absolute right-0 top-0 h-4 w-4 rounded-full border-2 border-[var(--background)] bg-green-500"
                  />
                )}

              </div>

              {/* UID */}

              <span className="mt-2 w-[68px] truncate text-center text-[13px] font-semibold">
                {getShortUid(person.uid)}
              </span>

            </button>
          );
        })}

        {/* MORE / LESS */}

        {hasMore && (
          <button
            type="button"
            onClick={() =>
              setExpanded(
                (current) => !current
              )
            }
            className="flex min-w-0 flex-col items-center text-center transition active:scale-95"
          >

            <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full border border-slate-300 dark:border-white/20">

              <span className="text-3xl leading-none text-slate-500 dark:text-slate-300">
                {expanded ? "⌃" : "⌄"}
              </span>

            </div>

            <span className="mt-2 text-[13px] font-semibold">
              {expanded ? "Less" : "More"}
            </span>

          </button>
        )}

      </div>

    </section>
  );
}