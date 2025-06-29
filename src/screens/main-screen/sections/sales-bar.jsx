import React from "react";
import {
  Plus,
  MoreHorizontal,
  Minus,
  X,
  Trash2,
  Trash,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import useGlobalStore from "@/hooks/useGlobalStore";
import Modal from "@/components/modal";
import PaymentScreen from "@/screens/payment-screen";
import PaymentCompletionScreen from "@/screens/payment-completion-screen";
import { sha256 } from "js-sha256";
import { useDatabase } from "@/services/db";

export function SalesBar() {
  const [selectedTicket, setSelectedTicket] = useState("ticket1");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [inputQuantities, setInputQuantities] = useState({});
  const tabsListRef = useRef(null);
  const db = useDatabase();

  const dollarToPesosRate = useGlobalStore(
    (state) => state.exchange_rate_usd_to_mxn
  );

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

  const handlePaymentComplete = async (details) => {
    // can be derived from the payment details amounts
    const paymentMethod = "CASH"; // Simplify for now
    const { total } = calculateTotals();
    console.log({ total });
    const ticketId = generateTicketId(paymentMethod, total);

    const fullPaymentDetails = {
      ...details,
      items: cartItems,
      ticketId: ticketId,
      totalDue: total,
    };

    setPaymentDetails(fullPaymentDetails);
    setIsPaymentModalOpen(false);

    // Record the sale and clear the cart
    await recordSale(ticketId, details);

    // Show completion modal
    setIsCompletionModalOpen(true);
  };

  const generateTicketId = (paymentMethod, totalAmount) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const data = `${totalAmount}${paymentMethod}${timestamp}${random}`;
    return sha256(data);
  };

  const generateTicketItemId = (ticketId, item) => {
    const data = `${ticketId}${item.sku}${item.quantity}${item.price}`;
    return sha256(data);
  };

  /**
   *
   * @param {paymentDetails} paymentDetails
   */
  const recordSale = async (ticketId, paymentDetails) => {
    try {
      const sql = await db.getConnection();
      const {
        totalPaid,
        change,
        dollarsPaid,
        pesosPaid,
        cardsPaid,
        othersPaid,
      } = paymentDetails;

      const ticketQuery = `
        INSERT INTO tickets (
          id, subtotal, taxes, total_due, dollars_paid, pesos_paid, cards_paid, others_paid, total_paid, change, cashier_name, pos_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await sql.execute(ticketQuery, [
        ticketId,
        subtotal,
        taxes,
        total,
        dollarsPaid,
        pesosPaid,
        cardsPaid,
        othersPaid,
        totalPaid,
        change,
        "Cashier",
        "POS1",
      ]);

      for (const item of cartItems) {
        const itemId = generateTicketItemId(ticketId, item);
        const itemTotal = item.price * (item.quantity || 1);
        const itemQuery = `
          INSERT INTO ticket_items (
            id, ticket_id, line_item_sku, line_item_plu_code, line_item_barcode,
            line_item_product_name, line_item_price, line_item_quantity, line_item_total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await sql.execute(itemQuery, [
          itemId,
          ticketId,
          item.sku,
          item.plu_code || null,
          item.barcode || null,
          item.product_name,
          item.price,
          item.quantity || 1,
          itemTotal,
        ]);
      }

      clearCart();
    } catch (err) {
      console.error("Error recording sale:", err.message);
      throw err;
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="border-b p-2 h-16 flex items-center shrink-0">
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
                Ticket de Venta
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
          <Button
            variant="ghost"
            size="sm"
            className="flex-none bg-background text-gray-600 w-4 h-6 hover:text-destructive"
            onClick={clearCart}
          >
            <Trash className="h-2 w-2" style={{ marginRight: "2px" }} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col select-none overflow-y-auto pb-[55px]">
          <table className="w-full products-table">
            <thead
              onClick={() => setSelectedItem(null)}
              className="cursor-default"
            >
              <tr className="text-sm font-medium">
                <th className="text-left px-2 pl-2.5 py-2 w-[40%]">Producto</th>
                <th className="text-center px-2 py-2 w-[26%]">Cant</th>
                <th className="text-right px-2 pr-2.5 py-2 w-[26%]">Monto</th>
                <td className="text-right w-[7%]">&nbsp;</td>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, i) => (
                <React.Fragment key={item.sku}>
                  <tr
                    className={`cursor-arrow ${
                      // hover:bg-accent/60
                      selectedItem === i
                        ? "" //"bg-accent/60 hover:bg-accent/60"
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
                      className="text-right px-0 py-2 flex"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-10"
                        onClick={() =>
                          updateItemQuantity(item.sku, (item.quantity || 0) - 1)
                        }
                      >
                        <Minus className="h-2 w-2" />
                      </Button>
                      <input
                        id={`quantity-${item.sku}`}
                        type="text"
                        value={
                          inputQuantities[item.sku] !== undefined
                            ? inputQuantities[item.sku]
                            : item.quantity || 0
                        }
                        onChange={(e) => {
                          //updateItemQuantity(item.sku, e.target.value)
                          const value = e.target.value;
                          setInputQuantities((prev) => ({
                            ...prev,
                            [item.sku]: value,
                          }));
                        }}
                        onBlur={(e) => {
                          const value = inputQuantities[item.sku];
                          // Trim white spaces and replace comma with dot for decimal values
                          const sanitizedValue = value.trim().replace(",", ".");
                          const parsedQuantity = parseFloat(sanitizedValue);
                          if (!isNaN(parsedQuantity) && parsedQuantity >= 0) {
                            updateItemQuantity(item.sku, parsedQuantity);
                          } else {
                            // Handle invalid input as needed
                            // For example, revert to previous valid quantity
                          }
                          // Clear the local input value
                          setInputQuantities((prev) => {
                            const newState = { ...prev };
                            delete newState[item.sku];
                            return newState;
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // Blur the current input
                            e.target.blur();
                            // Focus the search bar
                            const searchBar =
                              document.getElementById("search-bar");
                            if (searchBar) {
                              searchBar.focus();
                            }
                          }
                        }}
                        className="w-full text-center border-1 h-8"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-10"
                        onClick={() =>
                          updateItemQuantity(item.sku, (item.quantity || 0) + 1)
                        }
                      >
                        <Plus className="h-2 w-2" />
                      </Button>
                    </td>
                    <td
                      style={{ verticalAlign: "middle" }}
                      className="text-right px-2 pr-2.5 py-2"
                    >
                      ${(item.price * (item.quantity || 0)).toFixed(2)}
                    </td>
                    <td style={{ verticalAlign: "middle" }} className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 w-4 h-6 hover:text-destructive"
                        onClick={() => {
                          removeItem(item.sku);
                          setSelectedItem(null);
                        }}
                      >
                        <Trash className="h-2 w-2" />
                      </Button>
                    </td>
                  </tr>
                  {selectedItem === i && (
                    <>
                      {/*
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
                          <Button
                            variant="outline"
                            size="icon"
                            className=" text-destructive w-6 h-6"
                            onClick={() => {
                              removeItem(item.sku);
                              setSelectedItem(null);
                            }}
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-2 py-2 overflow-hidden">
                        <div className="flex items-center gap-1 justify-end"></div>
                      </td>
                      <td className="px-2 pr-2.5 py-2 ">
                        <div className="flex items-center justify-end"></div>
                      </td>
                    </tr>
                      */}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* TODO: If taxes are 0, don't show the sub-total and taxes rows 
        Perhaps use Alegro POS taxes UX */}
        <div className="pb-4 pl-3 pr-3 pt-2 flex flex-row items-start border-t-[1.5px] shrink-0 basis-[150px]">
          <div className="w-[45%] flex flex-col">
            <div className="flex justify-between items-center text-muted-foreground text-sm min-h-8">
              <div>Subtotal</div>
              <div className="font-bold text-right">${subtotal.toFixed(2)}</div>
            </div>

            <div className="flex justify-between items-center text-muted-foreground text-sm min-h-8">
              <div>Impuestos</div>
              <div className="font-bold text-right">${taxes.toFixed(2)}</div>
            </div>

            <div className="flex justify-between items-center text-muted-foreground text-sm min-h-8">
              <div>Total (PESOS)</div>
              <div className="font-bold text-right">${total.toFixed(2)}</div>
            </div>

            <div className="flex justify-between items-center text-muted-foreground text-sm min-h-8">
              <div>Total (DOLAR)</div>
              <div className="font-bold text-right">
                ${(total.toFixed(2) / dollarToPesosRate).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="w-[55%] flex flex-col pl-4 pt-2 justify-between  h-full">
            <Button
              variant="default_unhovered"
              onClick={() => setIsPaymentModalOpen(true)}
              className={`flex flex-col justify-center items-center text-white h-full ${
                total > 0 ? "hover:bg-black/70" : "opacity-50"
              }`}
            >
              <div className="text-xl">Pagar</div>
              <div className="text-xl font-bold text-right">
                ${total.toFixed(2)}
              </div>
            </Button>
          </div>
        </div>
      </div>
      {/* Payment modal */}
      <Modal
        handleClose={() => setIsPaymentModalOpen(false)}
        isOpen={isPaymentModalOpen}
        style={{ borderRadius: "100px" }}
      >
        <PaymentScreen
          handleClose={() => setIsPaymentModalOpen(false)}
          handlePaymentComplete={handlePaymentComplete}
          totalDue={total}
          dollarToPesosRate={dollarToPesosRate}
          style={{ borderRadius: "100px" }}
        />
      </Modal>

      {/* Completion modal - shown on top of SalesBar after payment is complete */}
      <Modal
        handleClose={() => setIsCompletionModalOpen(false)}
        isOpen={isCompletionModalOpen}
        type="small"
      >
        <PaymentCompletionScreen
          handleClose={() => setIsCompletionModalOpen(false)}
          paymentDetails={paymentDetails}
        />
      </Modal>
    </>
  );
}
