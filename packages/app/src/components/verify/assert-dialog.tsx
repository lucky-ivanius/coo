"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAssertion } from "@/hooks/use-assertion";
import { formatSbtc } from "@/lib/format";

import { InputGroup, InputGroupAddon, InputGroupNumberInput, InputGroupText } from "../ui/input-group";

const assertSchema = z.object({
  claim: z.string().min(1, "Claim is required"),
  bondSats: z
    .number({
      error: "Bond must be a valid number",
    })
    .min(10000, { error: "Bond must be at least 10,000 sats" }),
  liveness: z.number({ error: "Liveness must be a valid block number" }).min(1, { error: "Liveness must be at least 1 block" }).optional(),
});

export type AssertFormValues = z.infer<typeof assertSchema>;

interface AssertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssertDialog({ open, onOpenChange }: AssertDialogProps) {
  const form = useForm<AssertFormValues>({
    resolver: zodResolver(assertSchema),
    defaultValues: {
      claim: "",
      bondSats: undefined,
      liveness: undefined,
    },
    reValidateMode: "onBlur",
  });
  const createAssertion = useCreateAssertion();

  async function handleSubmit(values: AssertFormValues) {
    try {
      const enc = new TextEncoder();

      const result = await createAssertion.mutateAsync({
        identifier: enc.encode("statement"),
        claim: enc.encode(values.claim),
        bondSats: BigInt(values.bondSats),
        liveness: values.liveness ? BigInt(values.liveness) : undefined,
      });

      console.log(result);

      form.reset();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    }
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
                  <FieldLabel htmlFor="assert-bond">Bond</FieldLabel>

                  <InputGroup>
                    <InputGroupNumberInput {...field} min={10000} step={1} placeholder="10000" aria-invalid={fieldState.invalid || undefined} />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>sats</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

                  <FieldDescription>≈ {formatSbtc(form.watch("bondSats") ?? 0)} sBTC</FieldDescription>
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
                    Liveness <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>

                  <InputGroup>
                    <InputGroupNumberInput {...field} min={1} step={1} placeholder="1440" aria-invalid={fieldState.invalid || undefined} />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>blocks</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

                  <FieldDescription>Number of blocks the assertion can be disputed before settlement.</FieldDescription>
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
