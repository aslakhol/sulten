import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { cn } from "../../lib/utils";
import { type dinnerFormSchema } from "../../utils/types";
import { DinnerForm } from "./DinnerForm";
import { type z } from "zod";
import { api } from "../../utils/api";
import { toast } from "../../components/ui/use-toast";
import { usePostHog } from "posthog-js/react";
import { ChefHat } from "lucide-react";
import { useRouter } from "next/router";

export const NewDinner = () => {
  const utils = api.useUtils();
  const posthog = usePostHog();
  const router = useRouter();
  const dialogOpen = router.pathname === "/dinners/new";
  const setDialogOpen = (open: boolean) => {
    void router.push(open ? "/dinners/new" : "/dinners");
  };

  const createDinnerMutation = api.dinner.create.useMutation({
    onSuccess: (result) => {
      toast({
        title: `${result.dinner.name} created`,
      });
      setDialogOpen(false);
    },
    onSettled: () => {
      void utils.dinner.dinners.invalidate();
    },
  });

  function createDinner(values: z.infer<typeof dinnerFormSchema>) {
    posthog.capture("create new dinner", { dinnerName: values.name });

    createDinnerMutation.mutate({
      dinnerName: values.name,
      tagList: values.tags,
      link: values.link,
      notes: values.notes,
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        <div
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-left hover:bg-accent/50 hover:text-accent-foreground",
          )}
        >
          <ChefHat size={16} />
          <h3>Add new dinner</h3>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New dinner</DialogTitle>
        </DialogHeader>
        <DinnerForm
          closeDialog={() => setDialogOpen(false)}
          onSubmit={createDinner}
          isLoading={createDinnerMutation.isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
