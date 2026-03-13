"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SATS_PER_SBTC = 100_000_000;

const assertSchema = z.object({
  claim: z.string().min(1, "Claim is required"),
  bondSats: z
    .number({
      error: "Bond must be a valid number",
    })
    .min(10000, { error: "Bond must be at least 10,000 sats" }),
  liveness: z.number({ error: "Liveness must be a valid block number" }).min(1, { error: "Liveness must be at least 1 block" }),
});

type AssertFormValues = z.infer<typeof assertSchema>;

interface AssertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: AssertFormValues) => void;
}

export function AssertDialog({ open, onOpenChange, onSubmit }: AssertDialogProps) {
  const form = useForm<AssertFormValues>({
    resolver: zodResolver(assertSchema),
    defaultValues: {
      claim: "",
      bondSats: undefined,
      liveness: undefined,
    },
    reValidateMode: "onBlur",
  });

  function handleSubmit(values: AssertFormValues) {
    onSubmit?.(values);
    form.reset();

    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset();
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Assertion</DialogTitle>
          <DialogDescription>Submit a claim to the oracle. Bond will be locked for the liveness window.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup className="gap-5">
            {/* Claim */}
            <Controller
              name="claim"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="assert-claim">Claim</FieldLabel>

                  <Textarea
                    {...field}
                    placeholder="Enter a falsifiable statement, e.g. 'BTC price was above $100k on block 900000.'"
                    rows={3}
                    aria-invalid={fieldState.invalid || undefined}
                    className="min-h-24"
                  />

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Bond */}
            <Controller
              name="bondSats"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="assert-bond">
                    Bond <span className="font-normal text-muted-foreground">(sats)</span>
                  </FieldLabel>

                  <NumberInput {...field} min={1} step={1} placeholder="10000" aria-invalid={fieldState.invalid || undefined} />

                  <FieldDescription>
                    ≈ {(Number(form.watch("bondSats") ?? 0) / SATS_PER_SBTC).toLocaleString(undefined, { maximumFractionDigits: 8 })} sBTC
                  </FieldDescription>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Liveness */}
            <Controller
              name="liveness"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="assert-liveness">
                    Liveness <span className="font-normal text-muted-foreground">(Default: 1440 blocks = ~2 hours)</span>
                  </FieldLabel>

                  <NumberInput {...field} type="number" min={1} step={1} placeholder="1440" aria-invalid={fieldState.invalid || undefined} />

                  <FieldDescription>Number of blocks the assertion can be disputed before settlement.</FieldDescription>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="submit">Assert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
