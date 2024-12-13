import { useRouter } from "next/router";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import Link from "next/link";
import { SignedIn, SignInButton, SignedOut, useClerk } from "@clerk/nextjs";

export const BottomNav = () => {
  const router = useRouter();
  const { user } = useClerk();

  const onClick = !user?.publicMetadata.householdId
    ? async () => {
        await user?.reload();
        router.reload();
      }
    : undefined;

  return (
    <div className="pb-20">
      <div className="fixed bottom-0 flex w-full max-w-xl justify-around border-r border-t bg-white">
        <Button
          variant={"link"}
          className={cn(
            "w-full py-8 text-xl",
            router.asPath === "/" && "underline",
          )}
          onClick={onClick}
          asChild
        >
          <Link href="/">Plan</Link>
        </Button>
        <Button
          variant={"link"}
          className={cn(
            "w-full py-8 text-xl",
            router.asPath.startsWith("/dinners") && "underline",
          )}
          onClick={onClick}
          asChild
        >
          <Link href="/dinners">Dinners</Link>
        </Button>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant={"link"} className="w-full py-8 text-xl">
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Button
            variant={"link"}
            className={cn(
              "w-full py-8 text-xl",
              router.asPath.startsWith("/settings") && "underline",
            )}
            asChild
          >
            <Link href="/settings">Settings</Link>
          </Button>
        </SignedIn>
      </div>
    </div>
  );
};
