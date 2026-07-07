/**
 * Gamma Spec Order Messaging
 * Handles order threads with NIP-17 kind 14/16/17 messages
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useGammaOrders, useGammaOrderThread, useGammaOrderActions, type OrderThread, type OrderMessage } from '@/hooks/useGammaOrders';
import { genUserName } from '@/lib/genUserName';
import { useToast } from '@/hooks/useToast';
import type { OrderStatus } from '@/lib/gammaSpec';
import {
  MessageSquare, Send, Package, CheckCircle, Clock, XCircle, Truck, Loader2,
  ShoppingCart, Zap, ArrowRight, User, RefreshCw
} from 'lucide-react';

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',  icon: <Clock className="w-3 h-3" /> },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',          icon: <CheckCircle className="w-3 h-3" /> },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',  icon: <Package className="w-3 h-3" /> },
  completed:  { label: 'Completed',  color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',      icon: <CheckCircle className="w-3 h-3" /> },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',              icon: <XCircle className="w-3 h-3" /> },
};

function MessageBubble({ msg, currentPubkey }: { msg: OrderMessage; currentPubkey: string }) {
  const isMine = msg.fromPubkey === currentPubkey;
  const author = useAuthor(msg.fromPubkey);
  const displayName = author.data?.metadata?.name || genUserName(msg.fromPubkey);
  const avatar = author.data?.metadata?.picture;

  const getMessageLabel = () => {
    if (msg.kind === 16) {
      switch (msg.type) {
        case '1': return '🛒 Order Created';
        case '2': return '💳 Payment Request';
        case '3': return msg.status ? `📋 Status: ${msg.status}` : '📋 Status Update';
        case '4': return msg.shippingStatus ? `🚚 Shipping: ${msg.shippingStatus}` : '🚚 Shipping Update';
        default: return '📬 Order Message';
      }
    }
    if (msg.kind === 17) return '✅ Payment Receipt';
    return null;
  };

  const label = getMessageLabel();
  const time = new Date(msg.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = new Date(msg.createdAt * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-[9px]"><User className="w-3 h-3" /></AvatarFallback>
      </Avatar>
      <div className={`max-w-[75%] space-y-1 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isMine && <p className="text-[10px] text-muted-foreground px-1">{displayName}</p>}

        {label && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isMine ? 'bg-[#ec1a58]/10 text-[#ec1a58]' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'}`}>
            {label}
          </div>
        )}

        {/* Payment details */}
        {msg.payments && msg.payments.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-2 text-xs space-y-1 w-full">
            {msg.payments.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="capitalize font-medium">{p.medium}:</span>
                <span className="font-mono truncate text-[10px]">{p.reference.slice(0, 30)}…</span>
              </div>
            ))}
            {msg.amountSats && (
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <span>{Number(msg.amountSats).toLocaleString()} sats</span>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        {msg.items && msg.items.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-2 text-xs space-y-0.5 w-full">
            {msg.items.map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <Package className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono truncate text-[10px]">{item.productRef.split(':').pop()}</span>
                <span className="text-muted-foreground">× {item.quantity}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tracking info */}
        {msg.trackingNumber && (
          <div className="rounded-lg border bg-muted/30 p-2 text-xs w-full">
            <p className="font-medium flex items-center gap-1"><Truck className="w-3 h-3" /> Tracking</p>
            <p className="font-mono">{msg.trackingNumber}</p>
            {msg.carrier && <p className="text-muted-foreground">{msg.carrier}</p>}
          </div>
        )}

        {/* Content */}
        {msg.content && (
          <div className={`rounded-2xl px-3 py-2 text-sm ${isMine ? 'bg-[#ec1a58] text-white rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
            {msg.content}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground px-1">{date} {time}</p>
      </div>
    </div>
  );
}

function OrderThreadView({ thread }: { thread: OrderThread }) {
  const { user } = useCurrentUser();
  const { data: messages, isLoading, refetch } = useGammaOrderThread(thread.orderId);
  const { sendMessage, updateOrderStatus, sendShippingUpdate } = useGammaOrderActions();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Is the current user the merchant (sender of status updates)?
  const isMerchant = user?.pubkey === thread.merchantPubkey;
  const otherPubkey = isMerchant ? thread.buyerPubkey : thread.merchantPubkey;

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSending(true);
    try {
      await sendMessage({ recipientPubkey: otherPubkey, orderId: thread.orderId, message: messageText });
      setMessageText('');
      refetch();
    } catch {
      toast({ title: 'Failed to send message', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!isMerchant) return;
    setIsSending(true);
    try {
      await updateOrderStatus({ buyerPubkey: thread.buyerPubkey, orderId: thread.orderId, status });
      toast({ title: `Order status updated to ${status}` });
      refetch();
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const statusConfig = ORDER_STATUS_CONFIG[thread.latestStatus ?? 'pending'] ?? ORDER_STATUS_CONFIG.pending;

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Order #{thread.orderId.slice(6, 14).toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(thread.createdAt * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${statusConfig.color} flex items-center gap-1`}>
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
          <Button size="sm" variant="ghost" onClick={() => refetch()} className="h-7 w-7 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !messages?.length ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No messages yet
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <MessageBubble key={msg.eventId} msg={msg} currentPubkey={user?.pubkey ?? ''} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Merchant Status Actions */}
      {isMerchant && (
        <div className="border-t p-3 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Quick Status Update:</p>
          <div className="flex flex-wrap gap-1.5">
            {(['confirmed', 'processing', 'completed', 'cancelled'] as OrderStatus[]).map(s => {
              const cfg = ORDER_STATUS_CONFIG[s];
              return (
                <Button key={s} size="sm" variant="outline"
                  className={`text-xs h-7 ${thread.latestStatus === s ? cfg.color : ''}`}
                  onClick={() => handleStatusUpdate(s)} disabled={isSending}>
                  {cfg.icon}
                  <span className="ml-1">{cfg.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Textarea
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            placeholder="Type a message…"
            rows={2}
            className="flex-1 resize-none text-sm"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          />
          <Button size="sm" onClick={handleSendMessage} disabled={isSending || !messageText.trim()}
            className="self-end h-9 px-3">
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ThreadListItem({ thread, isActive, onClick }: { thread: OrderThread; isActive: boolean; onClick: () => void }) {
  const { user } = useCurrentUser();
  const isMerchant = user?.pubkey === thread.merchantPubkey;
  const otherPubkey = isMerchant ? thread.buyerPubkey : thread.merchantPubkey;
  const otherUser = useAuthor(otherPubkey);
  const displayName = otherUser.data?.metadata?.name || genUserName(otherPubkey);
  const avatar = otherUser.data?.metadata?.picture;

  const statusConfig = ORDER_STATUS_CONFIG[thread.latestStatus ?? 'pending'] ?? ORDER_STATUS_CONFIG.pending;
  const lastMsg = thread.messages[thread.messages.length - 1];

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors ${isActive ? 'bg-muted' : ''}`}
    >
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-xs"><User className="w-4 h-4" /></AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <Badge className={`text-[10px] ${statusConfig.color} flex items-center gap-0.5 flex-shrink-0`}>
            {statusConfig.icon}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          #{thread.orderId.slice(6, 14).toUpperCase()}
        </p>
        {lastMsg?.content && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{lastMsg.content}</p>
        )}
      </div>
    </button>
  );
}

/**
 * Full orders inbox panel
 */
export function GammaOrdersInbox({ className }: { className?: string }) {
  const { user } = useCurrentUser();
  const { data: threads, isLoading, refetch } = useGammaOrders();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const activeThread = threads?.find(t => t.orderId === activeThreadId);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div>
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Log in to view your orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex border rounded-xl overflow-hidden ${className ?? ''}`} style={{ minHeight: 480 }}>
      {/* Thread List */}
      <div className="w-64 border-r flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Orders</span>
            {threads && <Badge variant="secondary" className="text-xs">{threads.length}</Badge>}
          </div>
          <Button size="sm" variant="ghost" onClick={() => refetch()} className="h-7 w-7 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !threads?.length ? (
            <div className="text-center py-8 text-sm text-muted-foreground px-4">
              <Package className="w-6 h-6 mx-auto mb-2 opacity-30" />
              No orders yet
            </div>
          ) : (
            <div className="divide-y">
              {threads.map(thread => (
                <ThreadListItem
                  key={thread.orderId}
                  thread={thread}
                  isActive={activeThreadId === thread.orderId}
                  onClick={() => setActiveThreadId(thread.orderId)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Thread View */}
      <div className="flex-1 flex flex-col">
        {activeThread ? (
          <OrderThreadView thread={activeThread} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">Select an order to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact order start dialog — for buyers placing orders
 */
interface GammaOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  merchantPubkey: string;
  productRef: string;     // "30402:pubkey:d-tag"
  productTitle: string;
  priceInSats: string;
  shippingOptions?: Array<{ ref: string; label: string }>;
}

export function GammaOrderDialog({
  isOpen, onClose, merchantPubkey, productRef, productTitle, priceInSats, shippingOptions
}: GammaOrderDialogProps) {
  const { user } = useCurrentUser();
  const { createOrder } = useGammaOrderActions();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedShipping, setSelectedShipping] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const id = await createOrder({
        merchantPubkey,
        items: [{ productRef, quantity: '1' }],
        amountSats: priceInSats,
        shippingRef: selectedShipping || undefined,
        shippingAddress: address || undefined,
        customerEmail: email || undefined,
        notes: notes || undefined,
      });
      setOrderId(id);
      toast({ title: '🛒 Order sent!', description: 'The merchant will be notified.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to place order', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#ec1a58]" />
            Place Order
          </DialogTitle>
        </DialogHeader>

        {orderId ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Order Placed!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Order #{orderId.slice(6, 14).toUpperCase()} sent to merchant.<br />
                Check your Orders inbox for payment details.
              </p>
            </div>
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-sm font-medium">{productTitle}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                <span>{Number(priceInSats).toLocaleString()} sats</span>
              </div>
            </div>

            {shippingOptions && shippingOptions.length > 0 && (
              <div>
                <Label>Shipping Method</Label>
                <Select value={selectedShipping} onValueChange={setSelectedShipping}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select shipping…" /></SelectTrigger>
                  <SelectContent>
                    {shippingOptions.map(opt => (
                      <SelectItem key={opt.ref} value={opt.ref}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedShipping && (
              <div>
                <Label>Shipping Address</Label>
                <Textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Your delivery address…" rows={2} className="mt-1" />
              </div>
            )}

            <div>
              <Label>Email (optional)</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="for order updates" className="mt-1" />
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special requests…" rows={2} className="mt-1" />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleSubmit} className="flex-1" style={{ backgroundColor: '#ec1a58' }} disabled={isSubmitting || !user}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</> : <>Place Order <ArrowRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
            {!user && <p className="text-xs text-center text-muted-foreground">Login required to place orders</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
