"use client";

import { ArrowLeft, Info, LoaderCircle, Save, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createProposal, updateProposal } from "@/app/(ngo)/ngo/proposals/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROPOSAL_SECTORS, TAMIL_NADU_DISTRICTS } from "@/lib/proposals/constants";
import { proposalSchema, type ProposalFormValues, type ValidatedProposalValues } from "@/lib/proposals/schema";

interface ProposalFormProps {
  mode: "create" | "edit";
  proposalId?: string;
  initialValues?: Partial<ProposalFormValues>;
}

const baseValues: ProposalFormValues = {
  title: "",
  description: "",
  sector: "Education",
  requested_amount: 0,
  beneficiaries: 0,
  state: "Tamil Nadu",
  district: "",
  duration_months: 12,
  impact_statement: "",
  evidence_description: "",
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs font-medium text-rose-600">{message}</p> : null;
}

export function ProposalForm({ mode, proposalId, initialValues }: ProposalFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormValues, unknown, ValidatedProposalValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: { ...baseValues, ...initialValues },
  });

  const onSubmit = async (values: ValidatedProposalValues) => {
    setSubmitError(null);
    const result = mode === "edit" && proposalId
      ? await updateProposal(proposalId, values)
      : await createProposal(values);
    if (result?.error) setSubmitError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="animate-rise flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-950">
        <Info className="mt-0.5 size-5 shrink-0 text-emerald-700" />
        <p><span className="font-bold">How IGAI evaluates this:</span> IGAI uses project scope, beneficiary reach, cost, geographic need, feasibility, risk and evidence to evaluate proposals for CSR allocation.</p>
      </div>
      <Card className="animate-rise overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">Project essentials</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Tell us what you plan to deliver</h2>
          <p className="mt-2 text-sm text-slate-500">Fields marked required are used for the initial funding assessment.</p>
        </div>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="title">Project title *</Label>
            <Input id="title" placeholder="e.g. Rural STEM Learning Labs" aria-invalid={Boolean(errors.title)} {...register("title")} />
            <FieldError message={errors.title?.message} />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" placeholder="Describe the problem, planned activities, and expected outcome." aria-invalid={Boolean(errors.description)} {...register("description")} />
            <FieldError message={errors.description?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector">Sector *</Label>
            <Select id="sector" aria-invalid={Boolean(errors.sector)} {...register("sector")}>
              {PROPOSAL_SECTORS.map((sector) => <option key={sector}>{sector}</option>)}
            </Select>
            <FieldError message={errors.sector?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requested_amount">Requested funding (₹) *</Label>
            <Input id="requested_amount" type="number" min="1" step="1" placeholder="2500000" aria-invalid={Boolean(errors.requested_amount)} {...register("requested_amount", { valueAsNumber: true })} />
            {!errors.requested_amount ? <p className="text-xs text-slate-400">Enter the amount in INR without commas.</p> : null}
            <FieldError message={errors.requested_amount?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beneficiaries">Expected beneficiaries *</Label>
            <Input id="beneficiaries" type="number" min="1" step="1" placeholder="1200" aria-invalid={Boolean(errors.beneficiaries)} {...register("beneficiaries", { valueAsNumber: true })} />
            <FieldError message={errors.beneficiaries?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_months">Duration (months) *</Label>
            <Input id="duration_months" type="number" min="1" max="120" step="1" aria-invalid={Boolean(errors.duration_months)} {...register("duration_months", { valueAsNumber: true })} />
            <FieldError message={errors.duration_months?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input id="state" placeholder="Tamil Nadu" aria-invalid={Boolean(errors.state)} {...register("state")} />
            <FieldError message={errors.state?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District *</Label>
            <Select id="district" aria-invalid={Boolean(errors.district)} {...register("district")}>
              <option value="">Select district</option>
              {TAMIL_NADU_DISTRICTS.map(({ name }) => <option key={name}>{name}</option>)}
            </Select>
            <FieldError message={errors.district?.message} />
          </div>
        </div>
      </Card>

      <Card className="animate-rise overflow-hidden [animation-delay:80ms]">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">Supporting narrative</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Strengthen your proposal</h2>
          <p className="mt-2 text-sm text-slate-500">These details are optional and can be updated later.</p>
        </div>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="impact_statement">Impact statement</Label>
            <Textarea id="impact_statement" placeholder="What lasting change should this project create?" aria-invalid={Boolean(errors.impact_statement)} {...register("impact_statement")} />
            <FieldError message={errors.impact_statement?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evidence_description">Evidence description</Label>
            <Textarea id="evidence_description" placeholder="Mention baseline data, prior results, surveys, or research." aria-invalid={Boolean(errors.evidence_description)} {...register("evidence_description")} />
            <FieldError message={errors.evidence_description?.message} />
          </div>
        </div>
      </Card>

      {submitError ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{submitError}</div> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={mode === "edit" && proposalId ? `/ngo/proposals/${proposalId}` : "/ngo/proposals"} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
          <ArrowLeft className="size-4" /> Cancel
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : mode === "edit" ? <Save className="size-4" /> : <Send className="size-4" />}
          {isSubmitting ? "Saving…" : mode === "edit" ? "Save changes" : "Submit proposal"}
        </Button>
      </div>
    </form>
  );
}
