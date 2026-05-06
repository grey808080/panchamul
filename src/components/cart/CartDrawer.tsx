'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const t = useTranslations('cart');
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-bold text-slate-900">
                          {t('title')}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-slate-400 hover:text-slate-500 transition-colors"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        {items.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                              <ShoppingCartIcon className="h-10 w-10 text-slate-400" />
                            </div>
                            <p className="text-lg font-medium text-slate-900 mb-2">{t('emptyTitle')}</p>
                            <button
                              onClick={onClose}
                              className="text-primary hover:text-primary-dark font-medium transition-colors"
                            >
                              {t('continueShopping')} &rarr;
                            </button>
                          </div>
                        ) : (
                          <div className="flow-root">
                            <ul role="list" className="-my-6 divide-y divide-slate-200">
                              {items.map((item) => (
                                <li key={item.id} className="flex py-6 group">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                    {item.image ? (
                                      <Image
                                        src={item.image}
                                        alt={item.name_en}
                                        width={96}
                                        height={96}
                                        className="h-full w-full object-cover object-center"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <PhotoIcon className="h-8 w-8 text-slate-300" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col justify-between">
                                    <div>
                                      <div className="flex justify-between text-sm font-medium text-slate-900">
                                        <h3 className="line-clamp-2">
                                          <Link href={`/products/${item.slug}`} onClick={onClose}>
                                            {item.name_en}
                                          </Link>
                                        </h3>
                                        <p className="ml-4 whitespace-nowrap">{formatPrice(item.price)}</p>
                                      </div>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-1">
                                        <button
                                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                                        >
                                          <MinusIcon className="h-3 w-3" />
                                        </button>
                                        <span className="w-4 text-center font-medium text-slate-900">
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                                        >
                                          <PlusIcon className="h-3 w-3" />
                                        </button>
                                      </div>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          onClick={() => removeItem(item.id)}
                                          className="font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                          <span className="hidden sm:inline">{t('remove')}</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="border-t border-slate-200 bg-slate-50 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-slate-900 mb-4">
                          <p>{t('subtotal')}</p>
                          <p className="text-xl">{formatPrice(getTotal())}</p>
                        </div>
                        <div className="mt-6">
                          <button
                            onClick={handleCheckout}
                            className="w-full flex items-center justify-center rounded-xl border border-transparent bg-primary px-6 py-4 text-base font-semibold text-white shadow-lg hover:bg-primary-dark hover:shadow-xl transition-all active:scale-[0.98]"
                          >
                            {t('checkout')}
                          </button>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-slate-500">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="font-medium text-primary hover:text-primary-dark transition-colors"
                              onClick={onClose}
                            >
                              {t('continueShopping')}
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

// Temporary internal imports until we build all icons
function ShoppingCartIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

function PhotoIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}
