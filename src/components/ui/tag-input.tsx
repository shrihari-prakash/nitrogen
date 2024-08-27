import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

const tagVariants = cva(
  "transition-all border inline-flex items-center text-sm pl-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        primary:
          "bg-primary border-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "text-xs h-7",
        md: "text-sm h-8",
        lg: "text-base h-9",
        xl: "text-lg h-10",
      },
      shape: {
        default: "rounded-sm",
        rounded: "rounded-full",
        square: "rounded-none",
        pill: "rounded-lg",
      },
      borderStyle: {
        default: "border-solid",
        none: "border-none",
      },
      textCase: {
        uppercase: "uppercase",
        lowercase: "lowercase",
        capitalize: "capitalize",
      },
      interaction: {
        clickable: "cursor-pointer hover:shadow-md",
        nonClickable: "cursor-default",
      },
      animation: {
        none: "",
        fadeIn: "animate-fadeIn",
        slideIn: "animate-slideIn",
        bounce: "animate-bounce",
      },
      textStyle: {
        normal: "font-normal",
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        lineThrough: "line-through",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "default",
      borderStyle: "default",
      textCase: "capitalize",
      interaction: "nonClickable",
      animation: "fadeIn",
      textStyle: "normal",
    },
  }
);

export enum Delimiter {
  Comma = ",",
  Enter = "Enter",
  Space = " ",
}

type OmittedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "value"
>;

export type Tag = {
  id: string;
  text: string;
};

export interface TagInputProps
  extends OmittedInputProps,
    VariantProps<typeof tagVariants> {
  placeholder?: string;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  enableAutocomplete?: boolean;
  autocompleteOptions?: Tag[];
  maxTags?: number;
  minTags?: number;
  readOnly?: boolean;
  disabled?: boolean;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  allowDuplicates?: boolean;
  validateTag?: (tag: string) => boolean;
  delimiter?: Delimiter;
  showCount?: boolean;
  placeholderWhenFull?: string;
  sortTags?: boolean;
  delimiterList?: string[];
  truncate?: number;
  minLength?: number;
  maxLength?: number;
  value?: string | number | readonly string[] | { id: string; text: string }[];
  autocompleteFilter?: (option: string) => boolean;
  direction?: "row" | "column";
  onInputChange?: (value: string) => void;
  customTagRenderer?: (tag: Tag) => React.ReactNode;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onTagClick?: (tag: Tag) => void;
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>((props) => {
  const {
    id,
    placeholder,
    tags,
    setTags,
    variant,
    size,
    shape,
    className,
    enableAutocomplete,
    autocompleteOptions,
    maxTags,
    delimiter = Delimiter.Comma,
    onTagAdd,
    onTagRemove,
    allowDuplicates,
    showCount,
    validateTag,
    placeholderWhenFull = "Max tags reached",
    sortTags,
    delimiterList,
    truncate,
    autocompleteFilter,
    borderStyle,
    textCase,
    interaction,
    animation,
    textStyle,
    minLength,
    maxLength,
    direction = "row",
    onInputChange,
    customTagRenderer,
    onFocus,
    onBlur,
    onTagClick,
  } = props;

  const [inputValue, setInputValue] = React.useState("");
  const [tagCount, setTagCount] = React.useState(Math.max(0, tags.length));
  const inputRef = React.useRef<HTMLInputElement>(null);

  if (
    (maxTags !== undefined && maxTags < 0) ||
    (props.minTags !== undefined && props.minTags < 0)
  ) {
    console.warn("maxTags and minTags cannot be less than 0");
    toast.error("maxTags and minTags cannot be less than 0");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onInputChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      delimiterList
        ? delimiterList.includes(e.key)
        : e.key === delimiter || e.key === Delimiter.Enter
    ) {
      e.preventDefault();
      const newTagText = inputValue.trim();

      if (validateTag && !validateTag(newTagText)) {
        return;
      }

      if (minLength && newTagText.length < minLength) {
        console.warn("Tag is too short");
        toast.error("Tag is too short");
        return;
      }

      // Validate maxLength
      if (maxLength && newTagText.length > maxLength) {
        toast.error("Tag is too long");
        console.warn("Tag is too long");
        return;
      }

      const newTagId = uuid();

      if (
        newTagText &&
        (allowDuplicates || !tags.some((tag) => tag.text === newTagText)) &&
        (maxTags === undefined || tags.length < maxTags)
      ) {
        setTags([...tags, { id: newTagId, text: newTagText }]);
        onTagAdd?.(newTagText);
        setTagCount((prevTagCount) => prevTagCount + 1);
      }
      setInputValue("");
    }
  };

  const removeTag = (idToRemove: string) => {
    setTags(tags.filter((tag) => tag.id !== idToRemove));
    onTagRemove?.(tags.find((tag) => tag.id === idToRemove)?.text || "");
    setTagCount((prevTagCount) => prevTagCount - 1);
  };

  const filteredAutocompleteOptions = autocompleteFilter
    ? autocompleteOptions?.filter((option) => autocompleteFilter(option.text))
    : autocompleteOptions;

  const displayedTags = sortTags ? [...tags].sort() : tags;

  const truncatedTags = truncate
    ? tags.map((tag) => ({
        id: tag.id,
        text:
          tag.text?.length > truncate
            ? `${tag.text.substring(0, truncate)}...`
            : tag.text,
      }))
    : displayedTags;

  const onTagInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // add existing value as a tag and clear input by triggering the delimiter key on the input
    handleKeyDown({ key: delimiter, preventDefault: () => {} } as any);
    onBlur?.(e);
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "rounded-md",
          {
            "flex flex-wrap gap-2": direction === "row",
            "flex flex-col gap-2": direction === "column",
          },
          { "mb-3": tags.length !== 0 }
        )}
      >
        {truncatedTags.map((tagObj) =>
          customTagRenderer ? (
            customTagRenderer(tagObj)
          ) : (
            <span
              key={tagObj.id}
              className={cn(
                tagVariants({
                  variant,
                  size,
                  shape,
                  borderStyle,
                  textCase,
                  interaction,
                  animation,
                  textStyle,
                }),
                {
                  "justify-between": direction === "column",
                }
              )}
              onClick={() => onTagClick?.(tagObj)}
            >
              {tagObj.text}
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event from bubbling up to the tag span
                  removeTag(tagObj.id);
                }}
                className={cn("py-1 px-3 h-full hover:bg-transparent")}
              >
                <X size={14} />
              </Button>
            </span>
          )
        )}
      </div>
      {enableAutocomplete ? (
        <>
          <Command className="border mt-2 sm:min-w-[450px]">
            <CommandInput
              placeholder={
                maxTags !== undefined && tags.length >= maxTags
                  ? placeholderWhenFull
                  : placeholder
              }
              disabled={maxTags !== undefined && tags.length >= maxTags}
              onFocus={onFocus}
              onBlur={onTagInputBlur}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {filteredAutocompleteOptions?.map((optionObj) => (
                  <CommandItem
                    key={uuid()}
                    className={`${
                      maxTags !== undefined && tags.length >= maxTags
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`w-full ${
                        maxTags !== undefined && tags.length >= maxTags
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() => {
                        if (
                          optionObj.text &&
                          (allowDuplicates ||
                            !tags.some((tag) => tag.text === optionObj.text)) &&
                          (maxTags === undefined || tags.length < maxTags)
                        ) {
                          setTags([...tags, optionObj]);
                          onTagAdd?.(optionObj.text);
                          setTagCount((prevTagCount) => prevTagCount + 1);
                        }
                      }}
                    >
                      {optionObj.text}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {maxTags && (
            <div className="flex">
              <span className="text-muted-foreground text-sm mt-1 ml-auto">
                {`${tagCount}`}/{`${maxTags}`}
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          <Input
            ref={inputRef}
            id={id}
            type="text"
            placeholder={
              maxTags !== undefined && tags.length >= maxTags
                ? placeholderWhenFull
                : placeholder
            }
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onTagInputBlur}
            className={className}
            autoComplete={enableAutocomplete ? "on" : "off"}
            list={enableAutocomplete ? "autocomplete-options" : undefined}
            disabled={maxTags !== undefined && tags.length >= maxTags}
          />
          {showCount && maxTags && (
            <div className="flex">
              <span className="text-muted-foreground text-sm mt-1 ml-auto">
                {`${tagCount}`}/{`${maxTags}`}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
});

TagInput.displayName = "TagInput";

export { TagInput };
