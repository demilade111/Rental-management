import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function StandardLeaseStep3({
    standardLeaseData,
    setStandardLeaseData,
    onBack,
    onContinue,
}) {
    const services = [
        "Water", "Natural gas", "Cablevision", "Sewage disposal", 
        "Electricity", "Snow removal", "Internet", "Storage",
        "Heat", "Recreation facilities", "Garbage collection", "Recycling services",
        "Kitchen scrap collection", "Laundry (coin-op)", "Free laundry", "Refrigerator",
        "Dishwasher", "Stove and oven", "Window coverings", "Furniture",
        "Carpets"
    ];

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-center text-[20px] font-bold p-4">
                    Deposits & Services (Page 3 of 4)
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* Security Deposit */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Security Deposit</Label>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Amount ($)</Label>
                            <Input
                                type="number"
                                placeholder="e.g., 750"
                                min="0"
                                step="0.01"
                                value={standardLeaseData.securityDeposit}
                                onChange={(e) => setStandardLeaseData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Due Day</Label>
                                <Input
                                    type="number"
                                    placeholder="DD"
                                    min="1"
                                    max="31"
                                    value={standardLeaseData.securityDepositDay}
                                    onChange={(e) => setStandardLeaseData(prev => ({ ...prev, securityDepositDay: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Month</Label>
                                <Input
                                    type="number"
                                    placeholder="MM"
                                    min="1"
                                    max="12"
                                    value={standardLeaseData.securityDepositMonth}
                                    onChange={(e) => setStandardLeaseData(prev => ({ ...prev, securityDepositMonth: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Year</Label>
                                <Input
                                    type="number"
                                    placeholder="YYYY"
                                    min="2024"
                                    value={standardLeaseData.securityDepositYear}
                                    onChange={(e) => setStandardLeaseData(prev => ({ ...prev, securityDepositYear: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pet Damage Deposit */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-900">Pet Damage Deposit</Label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="petDepositNA"
                                checked={standardLeaseData.petDepositNA}
                                onCheckedChange={(checked) => setStandardLeaseData(prev => ({ ...prev, petDepositNA: checked }))}
                            />
                            <Label htmlFor="petDepositNA" className="text-xs text-gray-600 font-normal cursor-pointer">
                                Not applicable
                            </Label>
                        </div>
                    </div>
                    {!standardLeaseData.petDepositNA && (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-600">Amount ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 250"
                                    min="0"
                                    step="0.01"
                                    value={standardLeaseData.petDeposit}
                                    onChange={(e) => setStandardLeaseData(prev => ({ ...prev, petDeposit: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-600">Due Day</Label>
                                    <Input
                                        type="number"
                                        placeholder="DD"
                                        min="1"
                                        max="31"
                                        value={standardLeaseData.petDepositDay}
                                        onChange={(e) => setStandardLeaseData(prev => ({ ...prev, petDepositDay: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-600">Month</Label>
                                    <Input
                                        type="number"
                                        placeholder="MM"
                                        min="1"
                                        max="12"
                                        value={standardLeaseData.petDepositMonth}
                                        onChange={(e) => setStandardLeaseData(prev => ({ ...prev, petDepositMonth: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-600">Year</Label>
                                    <Input
                                        type="number"
                                        placeholder="YYYY"
                                        min="2024"
                                        value={standardLeaseData.petDepositYear}
                                        onChange={(e) => setStandardLeaseData(prev => ({ ...prev, petDepositYear: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Services Included in Rent */}
                <div className="border-t pt-4">
                    <Label className="text-sm font-semibold text-gray-900 mb-2 block">What is included in the rent?</Label>
                    <p className="text-xs text-gray-500 mb-3">Check all that apply</p>
                    <div className="grid grid-cols-2 gap-3">
                        {services.map((service) => (
                            <div key={service} className="flex items-center gap-2">
                                <Checkbox
                                    id={`service-${service}`}
                                    checked={standardLeaseData.includedServices.includes(service)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setStandardLeaseData(prev => ({ ...prev, includedServices: [...prev.includedServices, service] }));
                                        } else {
                                            setStandardLeaseData(prev => ({ ...prev, includedServices: prev.includedServices.filter(s => s !== service) }));
                                        }
                                    }}
                                />
                                <Label htmlFor={`service-${service}`} className="text-sm font-normal cursor-pointer">
                                    {service}
                                </Label>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 space-y-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Parking (number of vehicles)</Label>
                            <Input
                                type="number"
                                placeholder="e.g., 1"
                                min="0"
                                value={standardLeaseData.parkingSpaces}
                                onChange={(e) => setStandardLeaseData(prev => ({ ...prev, parkingSpaces: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Back + Continue Buttons */}
            <div className="flex justify-between mt-6 gap-4">
                <Button
                    variant="outline"
                    className="flex-1 py-6 rounded-2xl"
                    onClick={onBack}
                >
                    Back
                </Button>

                <Button
                    className="flex-1 py-6 rounded-2xl"
                    onClick={onContinue}
                >
                    Continue
                </Button>
            </div>
        </>
    );
}

