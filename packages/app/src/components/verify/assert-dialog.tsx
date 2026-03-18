"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { asciiToBytes, bytesToHex } from "@stacks/common";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAssertion } from "@/hooks/use-assertion";
import { getTransactionExplorerUrl } from "@/lib/explorer";
import { formatSbtc } from "@/lib/format";

import { InputGroup, InputGroupAddon, InputGroupNumberInput, InputGroupText } from "../ui/input-group";

const assertSchema = z.object({
  claim: z
    .string()
    .min(1, "Claim is required")
    .refine((v) => asciiToBytes(v).length <= 2048, { error: "Claim must be less than 2048 characters buffer" }),
  bondSats: z
    .number({
      error: "Bond must be a valid number",
    })
    .min(10000, { error: "Bond must be at least 10,000 sats" }),
  liveness: z.number({ error: "Liveness must be a valid block number" }).min(1, { error: "Liveness must be at least 1 block" }).nullable(),
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
      liveness: null,
    },
    reValidateMode: "onBlur",
  });
  const createAssertion = useCreateAssertion();

  async function handleSubmit(values: AssertFormValues) {
    try {
      const result = await createAssertion.mutateAsync({
        identifier: bytesToHex(asciiToBytes("statement")),
        claim: bytesToHex(asciiToBytes(values.claim)),
        bondSats: values.bondSats,
        liveness: values.liveness,
      });

      if (!result.txid) {
        toast.info("Transaction sent!", {
          position: "top-center",
        });

        form.reset();
        onOpenChange(false);

        return;
      }

      toast.info("Transaction sent!", {
        description: (
          <span className="text-muted-foreground text-xs">
            Transaction ID:{" "}
            <Link target="_blank" rel="noopener noreferrer" href={getTransactionExplorerUrl(result.txid)} className="underline">
              0x{result.txid}
            </Link>
          </span>
        ),
        position: "top-center",
      });

      form.reset();
      onOpenChange(false);
    } catch (e) {
      const message = e instanceof Error ? e.message.trim() : "Unknown error";

      if (message === "User rejected request") {
        toast.error(<span className="text-destructive">Failed to send transaction</span>, {
          description: <span className="text-muted-foreground text-xs">{message}</span>,
          position: "top-center",
        });
      }
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
                    minLength={1}
                    maxLength={2048}
                    placeholder="Enter a falsifiable statement, e.g. 'BTC price was above $100k on block 900000.'"
                    rows={3}
                    aria-invalid={fieldState.invalid || undefined}
                    className="max-h-48 min-h-24"
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
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assert-liveness">
                    Liveness <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>

                  <InputGroup>
                    <InputGroupNumberInput {...field} min={1} step={1} placeholder="1440" aria-invalid={fieldState.invalid} />
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
            <Button type="submit" disabled={createAssertion.isPending}>
              Assert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
