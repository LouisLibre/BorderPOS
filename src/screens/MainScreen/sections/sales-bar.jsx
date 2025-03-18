import React from "react";
import { Plus, MoreHorizontal, Minus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import useGlobalStore from "@/hooks/useGlobalStore";
import PaymentModal from "@/screens/PaymentScreen/modal";
import PaymentScreen from "@/screens/PaymentScreen/payment-screen";

export function SalesBar() {
  const [selectedTicket, setSelectedTicket] = useState("ticket1");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const tabsListRef = useRef(null);

  const cartItems = useGlobalStore((state) => state.cartItems);
  const removeItem = useGlobalStore((state) => state.removeItem);
  const updateItemQuantity = useGlobalStore(
    (state) => state.updateItemQuantity
  );
  const clearCart = useGlobalStore((state) => state.clearCart);

  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    const taxRate = 0.0; // 8% tax rate - adjust as needed
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes;
    return { subtotal, taxes, total };
  };

  const scrollTabIntoView = (value) => {
    const tabsContainer = tabsListRef.current;
    if (!tabsContainer) return;

    const selectedTab = tabsContainer.querySelector(`[data-value="${value}"]`);
    if (!selectedTab) return;

    const containerRect = tabsContainer.getBoundingClientRect();
    const tabRect = selectedTab.getBoundingClientRect();

    // Check if the tab is partially or fully out of view
    const isTabOutOfView =
      tabRect.left < containerRect.left || tabRect.right > containerRect.right;

    if (isTabOutOfView) {
      selectedTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  };

  const handleTabChange = (value) => {
    setSelectedTicket(value);
    scrollTabIntoView(value);
  };

  const { subtotal, taxes, total } = calculateTotals();

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="border-b p-2 h-14 flex items-center shrink-0">
          <Tabs
            defaultValue="ticket1"
            className="flex-1 min-w-0"
            onValueChange={handleTabChange}
          >
            <TabsList
              ref={tabsListRef}
              className="w-full justify-start h-auto p-0 bg-transparent overflow-x-auto hide-scrollbar"
            >
              <TabsTrigger
                value="ticket1"
                className="data-[state=active]:bg-accent px-4 py-2"
                data-value="ticket1"
              >
                {
                  // no number in the first ticket, reverse the icon
                }
                Current Ticket
              </TabsTrigger>
              {/* TODO: Remove commented code when ready to implement tabs
            <TabsTrigger
              value="ticket2"
              className="data-[state=active]:bg-accent px-4 py-2"
              data-value="ticket2"
            >
              Ticket #2
            </TabsTrigger>
            <TabsTrigger
              value="ticket3"
              className="data-[state=active]:bg-accent px-4 py-2"
              data-value="ticket3"
            >
              Ticket #3
            </TabsTrigger>
            */}
            </TabsList>
          </Tabs>
          {/* TODO: Remove commented code when ready to implement 
        <Button variant="ghost" size="sm" className="flex-none bg-background">
          {" "}
          <Plus className="h-4 w-4" />
        </Button>
        */}
        </div>

        <div className="flex-1 flex flex-col select-none overflow-y-auto pb-[55px]">
          <table className="w-full products-table">
            <thead
              onClick={() => setSelectedItem(null)}
              className="cursor-default"
            >
              <tr className="text-sm font-medium">
                <th className="text-left px-2 pl-2.5 py-2 w-[40%]">Product</th>
                <th className="text-right px-2 py-2 w-[20%]">Qty</th>
                <th className="text-right px-2 pr-2.5 py-2 w-[40%]">Amt</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, i) => (
                <React.Fragment key={item.sku}>
                  <tr
                    className={`hover:bg-accent/60 cursor-pointer ${
                      selectedItem === i
                        ? "bg-accent/60 hover:bg-accent/60"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedItem(selectedItem === i ? null : i)
                    }
                  >
                    <td
                      style={{ verticalAlign: "top" }}
                      className="text-left px-2 pl-2.5 py-2"
                    >
                      {item.product_name}
                    </td>
                    <td
                      style={{ verticalAlign: "top" }}
                      className="text-right px-2 py-2"
                    >
                      {item.quantity || 1}
                    </td>
                    <td
                      style={{ verticalAlign: "top" }}
                      className="text-right px-2 pr-2.5 py-2"
                    >
                      ${(item.price * (item.quantity || 1)).toFixed(2)}
                    </td>
                  </tr>
                  {selectedItem === i && (
                    <tr className="bg-accent/60">
                      <td className="px-2 pl-2.5 py-2 overflow-hidden">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 text-black text-bold"
                          >
                            <MoreHorizontal className="h-2 w-4" />
                          </Button>
                          <span className="text-gray-600 text-sm">options</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 overflow-hidden">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateItemQuantity(
                                item.sku,
                                (item.quantity || 1) - 1
                              )
                            }
                          >
                            <Minus className="h-2 w-2" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateItemQuantity(
                                item.sku,
                                (item.quantity || 1) + 1
                              )
                            }
                          >
                            <Plus className="h-2 w-2" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-2 pr-2.5 py-2 ">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            className="ml-auto text-destructive w-6 h-6"
                            onClick={() => {
                              removeItem(item.sku);
                              setSelectedItem(null);
                            }}
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* TODO: If taxes are 0, don't show the sub-total and taxes rows 
        Perhaps use Alegro POS taxes UX */}
        <div className="pb-4 pl-3 pr-3 pt-2 flex flex-col items-end border-t-[1.5px] shrink-0 ">
          <div className="w-full mb-2 pr-2 ">
            <div className="flex justify-between items-center text-muted-foreground text-sm min-h-8">
              <div>Subtotal</div>
              <div className="font-bold text-right">${subtotal.toFixed(2)}</div>
            </div>

            <div className="flex justify-between items-center text-muted-foreground text-sm min-h-8">
              <div>Taxes</div>
              <div className="font-bold text-right">${taxes.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex justify-between items-center bg-black text-white hover:bg-black/70 h-14"
            >
              <div className="text-xl">Pay Now</div>
              <div className="text-xl font-bold text-right">
                ${total.toFixed(2)}
              </div>
            </Button>
            <Button
              variant="outline"
              className="flex justify-between items-center h-10"
              onClick={clearCart}
            >
              <div className="text-xl">Cancel</div>
            </Button>
          </div>
        </div>
      </div>
      <PaymentModal
        handleClose={() => setIsPaymentModalOpen(false)}
        isOpen={isPaymentModalOpen}
      >
        <PaymentScreen />
      </PaymentModal>
    </>
  );
}
