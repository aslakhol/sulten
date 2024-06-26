import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "../../utils/api";
import { usePostHog } from "posthog-js/react";
import { toast } from "~/components/ui/use-toast";

type Props = {
  setOpenAddDinner: (newState: boolean) => void;
};

export const AddDinner = (props: Props) => {
  const [dinnerName, setDinnerName] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [tagList, setTagList] = useState<string[]>([]);

  const addDinnerMutation = api.dinner.create.useMutation({
    onSuccess: (result) => {
      toast({
        title: `Dinner added: ${result.dinner.name}`,
      });
      setDinnerName("");
      setTagValue("");
      setTagList([]);
    },
  });
  const utils = api.useUtils();
  const posthog = usePostHog();

  function addDinner() {
    posthog.capture("create new dinner", { dinnerName });

    addDinnerMutation.mutate(
      {
        dinnerName: dinnerName,
        secret: localStorage.getItem("sulten-secret"),
        tagList: tagList,
      },
      {
        onSettled: () => {
          void utils.dinner.dinners.invalidate();
        },
      },
    );
  }

  function addTagToTagList() {
    setTagList((prevValue) => {
      if (tagValue && !prevValue.includes(tagValue)) {
        return [...prevValue, tagValue];
      }
      return prevValue;
    });

    setTagValue("");
  }

  return (
    <div className="flex flex-grow flex-col rounded border px-4 py-4 hover:bg-accent/50 hover:text-accent-foreground">
      <div className="flex flex-col gap-2">
        <Input
          type="text"
          placeholder="Enter dinner name"
          value={dinnerName}
          onChange={(event) => setDinnerName(event.target.value)}
        />
        <Input
          type="text"
          placeholder="Enter tag"
          value={tagValue}
          onChange={(event) => setTagValue(event.target.value)}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tagList.map((tag) => {
          return (
            <div
              key={tag}
              className="rounded bg-green-100 px-2 py-1 text-green-800 active:bg-green-200"
            >
              {tag}
            </div>
          );
        })}

        <Button
          className="rounded border-green-400 bg-green-100 px-2 py-1 text-green-800 active:bg-green-200"
          variant="outline"
          onClick={addTagToTagList}
        >
          +
        </Button>
      </div>
      <div className="flex justify-between pt-6">
        <Button
          className="rounded border-blue-400 bg-blue-100 px-2 py-1 text-blue-800 active:bg-blue-200"
          variant="outline"
          onClick={addDinner}
        >
          Create dinner
        </Button>
        <Button
          className="rounded border-red-400 bg-red-100 px-2 py-1 text-red-800 active:bg-red-200"
          variant="outline"
          onClick={() => props.setOpenAddDinner(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
