--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."User" (id, "imageRef", "relativeUrl", name, "nameTamil", "countryCode", mobile, role, "createdAt", "updatedAt", status, salt, email, password, "referralCode") FROM stdin;
cc4e0b37-7f33-4e50-8524-784c12e3aed6	\N	\N	Product Vendor	\N	+91	1234567890	VENDOR	2025-06-05 05:47:53.218	2025-06-05 05:47:53.218	t	c4d704e6-a537-47fe-bc17-8dce4c08f624	productVendor@gmail.com	\N	\N
62c5b3a3-5ae5-4549-a46a-c875b725aff6	\N	\N	Admin	\N	+91	1234567893	ADMIN	2025-06-05 05:47:53.197	2025-06-05 05:47:53.197	t	f079a044-3822-41db-bc35-98b89b8d3011	eroways@gmail.com	$2b$10$QujWRvMd/3r8HyWm2.zk8uEuS2nKjON8jnlWCOkTv6XXD6.vw4MSi	\N
f20362b6-0f43-4b85-8d82-03439afbd98c	\N	\N	Customer1	\N	+91	0987654321	CUSTOMER	2025-06-05 05:47:53.213	2025-06-05 05:47:53.213	t	2dcef345-987d-4d41-b640-1abf0e2a4596	user1@gmail.com	$2b$10$cfSim7j6bdb9J45ETBNxmuqAAey9d.70cud4SxMgACff3Z84DARY.	\N
a77b3323-008e-4d9d-9fe3-7d4b8867d63b	\N	\N	Customer3	\N	+91	0987654323	CUSTOMER	2025-06-05 05:47:53.213	2025-06-05 05:47:53.213	t	e8a9be36-eb55-4f7a-ad26-0a664cd33da7	user3@gmail.com	$2b$10$cfSim7j6bdb9J45ETBNxmuqAAey9d.70cud4SxMgACff3Z84DARY.	\N
f02d79a1-4b31-46e9-a6e5-df4b3cc6fc39	http://localhost:3000/client/vendors/1750152871085-718466256-Rectangle 39.png	./uploads/vendors/1750152871085-718466256-Rectangle 39.png	Service vendor 2	\N	+91	1234567892	VENDOR	2025-06-17 09:34:31.089	2025-06-17 09:34:31.106	t	b15fc9fa-bdea-480c-8283-5fd1469241ab	a@gmail.com	\N	2LLVNDKYO3
5352645c-7749-4af0-bd27-5b4ac3dfcc79	\N	\N	Customer2	\N	+91	0987654322	CUSTOMER	2025-06-05 05:47:53.213	2025-07-18 05:12:04.956	t	869f7525-7f2b-4dd4-9692-c3857270b505	user2@gmail.com	$2b$10$cfSim7j6bdb9J45ETBNxmuqAAey9d.70cud4SxMgACff3Z84DARY.	\N
b98b1997-e541-41fb-b143-ecda3d051aae	\N	\N	Customer	\N	+91	1234512345	CUSTOMER	2025-06-05 05:47:53.295	2025-07-18 05:20:00.149	t	683660a5-ac7c-4273-bc87-c9126a58db0f	user@gmail.com	$2b$10$cfSim7j6bdb9J45ETBNxmuqAAey9d.70cud4SxMgACff3Z84DARY.	\N
266673fd-7155-4951-a32a-5bb788382e5a	\N	\N	Service Vendor	\N	+91	1234567891	VENDOR	2025-06-05 05:47:53.213	2025-07-18 07:09:46.214	t	818de18e-b3a7-4da3-8b9f-d9bfca96f767	serviceVendor@gmail.com	\N	\N
86f25261-13da-4d9c-8727-945357cfabd5	http://localhost:3000/client/vendors/1752644900927-177542012-rob-lambert-9Q_pLLP_jmA-unsplash.jpg	./uploads/vendors/1752644900927-177542012-rob-lambert-9Q_pLLP_jmA-unsplash.jpg	Product vendor 2	\N	+91	9787652626	VENDOR	2025-07-16 05:48:20.931	2025-07-18 07:09:31.307	t	85e0b70f-5231-4318-9040-132688378ccb	b@gmail.com	\N	4VFD8L1P0C
de14e895-4ece-45f0-90fc-e04695d112da	http://localhost:3000/client/vendors/1754305041870-376727054-ant-rozetsky-io7dX_1EFCg-unsplash.jpg	./uploads/vendors/1754305041870-376727054-ant-rozetsky-io7dX_1EFCg-unsplash.jpg	BannerVendor1	\N	+91	1234554321	VENDOR	2025-08-04 10:57:21.876	2025-08-04 10:57:22.103	t	796a0ce3-2dad-418d-8022-f9637e5e90ed	banner@gmail.com	\N	1QLFVA6XGE
bcd76455-81de-4e54-9a73-e1fec954c1ea	http://localhost:3000/client/profiles/1754991824943-793898041-machine -1.jpg	./uploads/profiles/1754991824943-793898041-machine -1.jpg	Arunkumar	\N	+91	9797979797	CUSTOMER	2025-08-12 09:45:32.525	2025-08-12 09:45:32.582	t	aa841b9c-f9f0-4483-a42e-ae943d13692b	arun@gmail.com	$2b$10$.YVMT64ZbRnVb5hwgeM2/Ok.TJTKuG0TnPSOLMNEFEx2CmucAwUWu	4UYFQF8CXR
cc9fc7b2-f4df-4d38-8859-2d0d4733340d	http://localhost:3000/client/vendors/1754992667222-682885455-App Store - Chat History page screeshot (1).jpg	./uploads/vendors/1754992667222-682885455-App Store - Chat History page screeshot (1).jpg	Krishna Kumar	\N	+91	5757575757	VENDOR	2025-08-12 10:01:21.979	2025-08-12 10:01:23.023	t	07dc0bc2-82b3-4a21-bd23-1af001e2fbb6	krish@gmail.com	$2b$10$iR7IFVRQrg9OaUdB1SJR3uvqTALG.m8xtl4Qpe8/5PramfTHThjwK	WEJFY9FCR
893baaa4-fa39-4993-a1dd-b42eac39b568	http://localhost:3000/client/profiles/1755017004832-667031597-App Store - Chat History page screeshot (1).jpg	./uploads/profiles/1755017004832-667031597-App Store - Chat History page screeshot (1).jpg	Arunkumar	\N	+91	6369913564	CUSTOMER	2025-08-12 16:44:35.481	2025-08-12 16:44:35.53	t	0fb54a10-dfb4-4dae-8a4a-0663d935d53b	arunarun@gmail.com	$2b$10$SK9K08QTxlS5P1A.ax89zu8rC80mjP6L7g5x4a5AAsgzIh.BAJ9.W	1HIBRYQ4NV
239a54f7-1f35-442b-be25-e188456d8faa	http://localhost:3000/client/../../erowayz_uploads/profiles/1758350571602-277225282-1758003260051.jpg	/Users/rithi/Desktop/Arunkumar/project/erowayz_uploads/profiles/1758350571602-277225282-1758003260051.jpg	Arunkumar	\N	+91	7689456712	CUSTOMER	2025-09-20 06:42:51.605	2025-09-20 06:42:51.634	t	7619a1ed-057c-409c-b9cd-e6ca0f01ed1a	g@gmail.com	\N	4LJNQ0WPTD
\.


--
-- Data for Name: VendorType; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."VendorType" (id, name, "imageRef", "shopDynamicFields", type, "creatorId", "relativeUrl", "createdAt", "updatedAt") FROM stdin;
3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	Street Food Vendor	\N	\N	PRODUCT	62c5b3a3-5ae5-4549-a46a-c875b725aff6	\N	2025-06-05 05:47:53.201	2025-06-05 05:47:53.201
487d6baa-d79b-410f-b2c4-993388ab3a19	Common Shop Vendor	\N	\N	BANNER	62c5b3a3-5ae5-4549-a46a-c875b725aff6	\N	2025-06-05 05:47:53.207	2025-06-05 05:47:53.207
726f6995-1873-49dd-b500-ec6ec3151e77	Service Vendor	\N	\N	SERVICE	62c5b3a3-5ae5-4549-a46a-c875b725aff6	\N	2025-06-05 05:47:53.208	2025-06-05 05:47:53.208
c34edb3b-56de-4e18-aca2-efdfb5a1417b	Car Service	http://localhost:3000/client/vendortypes/1753185441824-283576461-chicken_gravy_spicy.jpg	\N	SERVICE	62c5b3a3-5ae5-4549-a46a-c875b725aff6	./uploads/vendortypes/1753185441824-283576461-chicken_gravy_spicy.jpg	2025-07-22 10:51:15.996	2025-07-22 11:57:21.827
\.


--
-- Data for Name: Vendor; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Vendor" (id, "userId", "vendorTypeId", "paymentMethod", "createdAt", "updatedAt") FROM stdin;
20c3ef80-f5eb-4fb6-b3c5-3405ab0fc58b	266673fd-7155-4951-a32a-5bb788382e5a	726f6995-1873-49dd-b500-ec6ec3151e77	{CASH}	2025-06-05 05:47:53.213	2025-06-05 05:47:53.213
9e7a1818-1136-4989-8435-7c1c231ae855	cc4e0b37-7f33-4e50-8524-784c12e3aed6	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{CASH}	2025-06-05 05:47:53.218	2025-06-05 05:47:53.218
8cd1b5a8-963c-40c5-a181-b74b90e1bba3	f02d79a1-4b31-46e9-a6e5-df4b3cc6fc39	726f6995-1873-49dd-b500-ec6ec3151e77	{CASH}	2025-06-17 09:34:31.089	2025-06-17 09:34:31.089
2df60053-9fbc-4f09-a292-6915fa413b57	86f25261-13da-4d9c-8727-945357cfabd5	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{CASH}	2025-07-16 05:48:20.931	2025-07-16 05:48:20.931
7a6a64b3-05b9-4a19-b338-89fec006450f	de14e895-4ece-45f0-90fc-e04695d112da	487d6baa-d79b-410f-b2c4-993388ab3a19	{CASH}	2025-08-04 10:57:21.876	2025-08-04 10:57:21.876
a68cbd24-f192-421b-bd0c-b37612645719	cc9fc7b2-f4df-4d38-8859-2d0d4733340d	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{CASH}	2025-08-12 10:01:21.979	2025-08-12 10:01:21.979
\.


--
-- Data for Name: AdminVendorCredit; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."AdminVendorCredit" (id, "vendorId", "totalGiven", "totalRefunded", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BankName; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."BankName" (id, name, status, image, "createdAt", "updatedAt") FROM stdin;
624d3143-a558-4f0e-b380-2a5ca0cd18cf	South Indian Bank	ACTIVE	/Users/rithi/Desktop/Arunkumar/project/erowayz_uploads/bankName/1758361563339-440918768-dine (1).png	2025-09-20 09:44:04.034	2025-09-20 09:46:03.34
8fe49be1-d55b-48db-ab3b-6d694810c62d	North Indian Bank	ACTIVE	/Users/rithi/Desktop/Arunkumar/project/erowayz_uploads/bankName/1758475217480-355509367-car.png	2025-09-21 17:20:17.482	2025-09-21 17:20:17.482
\.


--
-- Data for Name: BankPaymentType; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."BankPaymentType" (id, name, status, image, "createdAt", "updatedAt") FROM stdin;
d5b66e19-1743-4194-a441-1911da0a6a20	Amazon Pay	ACTIVE	/Users/rithi/Desktop/Arunkumar/project/erowayz_uploads/bankPaymentType/1758361834435-408687227-img.png	2025-09-20 09:50:34.437	2025-09-20 09:50:34.437
1f86fa38-0e89-4c62-a0b2-b245fc2da6a6	Google pay	ACTIVE	/Users/rithi/Desktop/Arunkumar/project/erowayz_uploads/bankPaymentType/1758475602502-109284068-Salad.jpg	2025-09-21 17:26:42.504	2025-09-21 17:26:42.504
\.


--
-- Data for Name: BankDetail; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."BankDetail" (id, "accountHolderName", "accountNumber", "ifscCode", "bankName", "bankNameId", "branchName", "accountType", "bankPlatformType", "bankPaymentTypeId", "linkedPhoneNumber", "upiId", "isVerified", "vendorId", "createdAt", "updatedAt") FROM stdin;
29c222f7-159a-4490-8e97-45443185ca7c	Product vendor	Ab54654u8jghgdbdf	43567	South Indian Vangi	\N	Coimbatore	CURRENT	\N	\N	\N	\N	t	9e7a1818-1136-4989-8435-7c1c231ae855	2025-06-09 08:29:04.546	2025-06-09 08:48:32.068
\.


--
-- Data for Name: Banner; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Banner" (id, name, "bannerType", title, "subTitle", "subHeading", description, "vendorId", "textColor", "startDateTime", "endDateTime", "bgColor", "bgImageRef", "bgImageRelativeUrl", "fgImageRef", "fgImageRelativeUrl", "fgImagePosition", "minApplyValue", "offerType", "offerValue", status, "originalPricePerUnit", qty, "qtyUnit", "createdAt", "updatedAt") FROM stdin;
4b4629fc-bdb7-4a8a-b1b0-b36357dc2afb	Alert🔔 Flat 15% offer on all orange products	PRODUCT	Hello	\N	This is sub heading	\N	9e7a1818-1136-4989-8435-7c1c231ae855	#f0efe4	2025-06-12 08:08:57	2026-06-12 08:08:57	#1703fc	\N	\N	http://localhost:3000/client/banner/1749715499919-69164356-20250426_185541.jpg	./uploads/banner/1749715499919-69164356-20250426_185541.jpg	LEFT	200	PERCENTAGE	10	ACTIVE	\N	\N	\N	2025-06-12 08:04:59.921	2025-06-12 08:05:59.108
f597f61c-61ef-4fe4-b27a-a9652d29bae4	Alert🔔 Flat 15% offer on all orange products	REGULAR	Hello	Hello all	How are you	\N	7a6a64b3-05b9-4a19-b338-89fec006450f	#f0efe4	2025-08-04 11:02:26	2025-08-05 10:59:26	#1703fc	\N	\N	http://localhost:3000/client/banner/1754305283717-164894614-App Store - Chat History page screeshot (2).jpg	./uploads/banner/1754305283717-164894614-App Store - Chat History page screeshot (2).jpg	LEFT	200	PERCENTAGE	10	ACTIVE	100	10	KG	2025-08-04 11:01:23.719	2025-08-04 11:01:23.719
c32b5e65-ca77-4c12-9eb4-7450b067613b	Alert🔔 Flat 15%  on all orange products	REGULAR	Hello	Hello all	How are you	\N	7a6a64b3-05b9-4a19-b338-89fec006450f	#f0efe4	2025-08-13 10:36:46	2025-08-14 10:25:48	#1703fc	\N	\N	http://localhost:3000/client/banner/1755081301217-366459333-App Store - Chat History page screeshot (1).jpg	./uploads/banner/1755081301217-366459333-App Store - Chat History page screeshot (1).jpg	LEFT	200	PERCENTAGE	10	ACTIVE	100	10	KG	2025-08-13 10:35:01.219	2025-08-13 10:35:01.219
\.


--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Booking" (id, "bookedId", "userId", "bookingStatus", "createdAt", "updatedAt", "declineType", "declinedBy", "declinedReason") FROM stdin;
3b53fa3e-2a99-4987-b7f8-c12f6fb2b150	BO25060001	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	PENDING	2025-06-17 11:46:20.673	2025-06-17 11:46:20.673	\N	\N	\N
95a8639b-2446-4cb5-9a1e-53c6a64fc7fd	BO25060002	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	PENDING	2025-06-20 05:26:15.067	2025-06-20 05:26:15.067	\N	\N	\N
fec7709b-6d68-4e31-a0bb-28b2a29729fd	BO250729001	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	PENDING	2025-07-29 06:10:12.284	2025-07-29 06:10:12.284	\N	\N	\N
6465368c-e1fc-4517-bc50-5749cf58974a	BO250729002	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	PENDING	2025-07-29 06:10:18.076	2025-07-29 06:10:18.076	\N	\N	\N
e18ba8ef-cb53-487f-8115-588f26b1165e	BO250804001	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	IN_PROGRESS	2025-08-04 11:02:35.857	2025-08-04 11:23:19.694	\N	\N	\N
0c09298b-d6e1-4812-8b77-028440c2866a	BO250804002	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	PENDING	2025-08-04 11:26:52.769	2025-08-04 11:26:52.769	\N	\N	\N
3e17a161-85ab-4494-b754-a0891a76cf85	BO250804003	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	PENDING	2025-08-04 11:30:50.69	2025-08-04 11:30:50.69	\N	\N	\N
\.


--
-- Data for Name: BannerBooking; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."BannerBooking" (id, "bookingId", "bannerId", "vendorId", "arrivalTime", "bannerName", "offerType", "offerValue", "minApplyValue", "startDateTime", "endDateTime", "createdAt", "updatedAt", "bgImageRef", "fgImageRef") FROM stdin;
05853481-ba2e-49b4-9fc1-80220ed7e416	e18ba8ef-cb53-487f-8115-588f26b1165e	f597f61c-61ef-4fe4-b27a-a9652d29bae4	7a6a64b3-05b9-4a19-b338-89fec006450f	2025-08-04 13:59:26	Alert🔔 Flat 15% offer on all orange products	PERCENTAGE	10	200	2025-08-04 11:02:26	2025-08-05 10:59:26	2025-08-04 11:02:35.857	2025-08-04 11:02:35.857	\N	http://localhost:3000/client/banner/1754305283717-164894614-App Store - Chat History page screeshot (2).jpg
7c9db3e8-2e87-402b-a812-8b907fd3b1d4	0c09298b-d6e1-4812-8b77-028440c2866a	f597f61c-61ef-4fe4-b27a-a9652d29bae4	7a6a64b3-05b9-4a19-b338-89fec006450f	2025-08-04 13:59:26	Alert🔔 Flat 15% offer on all orange products	PERCENTAGE	10	200	2025-08-04 11:02:26	2025-08-05 10:59:26	2025-08-04 11:26:52.769	2025-08-04 11:26:52.769	\N	http://localhost:3000/client/banner/1754305283717-164894614-App Store - Chat History page screeshot (2).jpg
627e600a-7dfb-4dee-be84-a112604541ab	3e17a161-85ab-4494-b754-a0891a76cf85	f597f61c-61ef-4fe4-b27a-a9652d29bae4	7a6a64b3-05b9-4a19-b338-89fec006450f	2025-08-04 13:59:26	Alert🔔 Flat 15% offer on all orange products	PERCENTAGE	10	200	2025-08-04 11:02:26	2025-08-05 10:59:26	2025-08-04 11:30:50.69	2025-08-04 11:30:50.69	\N	http://localhost:3000/client/banner/1754305283717-164894614-App Store - Chat History page screeshot (2).jpg
\.


--
-- Data for Name: BannerItemImages; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."BannerItemImages" (id, "imageRef", "relativeUrl", "createdAt", "updatedAt", "bannerId") FROM stdin;
\.


--
-- Data for Name: BannerVendorItem; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."BannerVendorItem" (id, name, description, price, "discountPrice", "vendorId", "quantityUnit", quantity, productstatus, status, "expiryDate", "createdAt", "updatedAt") FROM stdin;
82a6c3b7-6bf4-41b4-9866-902d10e89e8f	Chicken Gravy	It is chicken gravy	100	\N	9e7a1818-1136-4989-8435-7c1c231ae855	GENERAL	0	AVAILABLE	ACTIVE	\N	2025-06-15 10:24:22.946	2025-06-15 10:24:22.946
\.


--
-- Data for Name: BannerVendorItemsImage; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."BannerVendorItemsImage" (id, "bannerVendorItemId", "absoluteUrl", "relativeUrl", "createdAt", "updatedAt") FROM stdin;
4a91af3f-4c12-4f4f-b298-f6870043f33c	82a6c3b7-6bf4-41b4-9866-902d10e89e8f	http://localhost:3000/client/bannerVendorItem/1749983062941-476809508-Chat History page screeshot.jpg	./uploads/bannerVendorItem/1749983062941-476809508-Chat History page screeshot.jpg	2025-06-15 10:24:22.946	2025-06-15 10:24:22.946
\.


--
-- Data for Name: BloodDetails; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."BloodDetails" (id, "userId", "bloodGroup", "isDonor", city, area, "createdAt", "updatedAt") FROM stdin;
9a5672e4-b013-4e08-a691-0bb0561e01e0	239a54f7-1f35-442b-be25-e188456d8faa	A_POSITIVE	t	Coimbatore	Coimbatore	2025-09-20 06:42:51.609	2025-09-20 06:42:51.609
\.


--
-- Data for Name: BloodRequest; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."BloodRequest" (id, "userId", "donorId", "patientName", "hospitalName", "patientMobileNumber", "createdAt", "updatedAt", "dynamicFieldData") FROM stdin;
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Cart" (id, "userId", "createdAt", "updatedAt", "vendorId") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Category" (id, name, "imageRef", "createdAt", "updatedAt", "relativeUrl", "vendorTypeId") FROM stdin;
25afe9eb-9278-4402-a6f5-5d9637d635c1	NonVeg	http://localhost:3000/client/category/1749448903977-161351521-chicken_gravy_spicy.jpg	2025-06-09 06:01:43.978	2025-06-09 06:01:43.978	./uploads/category/1749448903977-161351521-chicken_gravy_spicy.jpg	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2
f358e9f6-c2d7-4085-bddb-0fe7e64b4244	Non-Veg	http://localhost:3000/client/category/1750326636229-8088344-—Pngtree—flat motorcycle png download_4684630.png	2025-06-19 09:50:36.23	2025-06-19 09:51:15.375	./uploads/category/1750326636229-8088344-—Pngtree—flat motorcycle png download_4684630.png	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2
bd3673a7-8e6d-4bd4-90f7-b8ec83e9ea21	Veg	http://localhost:3000/client/category/1753192747356-271002154-App Store - Chat History Files sending.jpg	2025-07-22 13:54:49.948	2025-07-22 13:59:07.357	./uploads/category/1753192747356-271002154-App Store - Chat History Files sending.jpg	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2
\.


--
-- Data for Name: ProductUnit; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ProductUnit" (id, name, status, "createdAt", "updatedAt") FROM stdin;
d495e3b9-fbbe-4852-9baa-01cee625766a	KG	ACTIVE	2025-09-20 09:34:49.494	2025-09-20 09:34:49.494
1f35bf3d-b720-451e-ab10-514241786393	GRAM	ACTIVE	2025-09-20 09:34:53.503	2025-09-20 09:35:24.707
7f697510-3c75-44ab-853e-4b31d639e995	MilliGram	ACTIVE	2025-09-21 16:38:34.438	2025-09-21 16:38:34.438
\.


--
-- Data for Name: SubCategory; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."SubCategory" (id, name, "imageRef", "relativeUrl", "categoryId", "createdAt", "updatedAt") FROM stdin;
52b2ee32-79d4-4a3e-8529-be68f1e8af1f	Gravy	http://localhost:3000/client/subCategory/1749448975536-519029495-Chich_gravy_img.jpg	./uploads/subCategory/1749448975536-519029495-Chich_gravy_img.jpg	25afe9eb-9278-4402-a6f5-5d9637d635c1	2025-06-09 06:02:55.537	2025-06-09 06:02:55.537
e94d4a15-32c7-4445-b11e-0e6a37a79e0a	Briyani	http://localhost:3000/client/subCategory/1750326698864-852911473-lefebvre.jpeg	./uploads/subCategory/1750326698864-852911473-lefebvre.jpeg	f358e9f6-c2d7-4085-bddb-0fe7e64b4244	2025-06-19 09:51:38.865	2025-06-19 09:51:38.865
c183e085-be26-4c58-a3a0-b61d9e39a53c	Briyani	http://localhost:3000/client/subCategory/1753193628559-642178142-f84987b7-b062-4d23-81ff-7f702719bd48.jpeg	./uploads/subCategory/1753193628559-642178142-f84987b7-b062-4d23-81ff-7f702719bd48.jpeg	bd3673a7-8e6d-4bd4-90f7-b8ec83e9ea21	2025-07-22 14:13:48.561	2025-07-22 14:13:48.561
\.


--
-- Data for Name: Item; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Item" (id, name, "nameTamil", description, "descriptionTamil", price, "discountPrice", "minSellingQty", "vendorId", "categoryId", "createdAt", "updatedAt", "subCategoryId", "quantityUnit", "productUnitId", "dailyTotalQty", "remainingQty", productstatus, status, "totalQtyEditCount", "expiryDate") FROM stdin;
bed18bf1-88b3-4325-9846-1dfab44d2082	Kunfu Briyani	\N	It is some what spicy	\N	1000	500	2	9e7a1818-1136-4989-8435-7c1c231ae855	f358e9f6-c2d7-4085-bddb-0fe7e64b4244	2025-07-04 13:14:24.32	2025-07-04 13:14:24.32	e94d4a15-32c7-4445-b11e-0e6a37a79e0a	SERVE	\N	50	50	OUT_OF_STOCK	ACTIVE	0	2025-05-12 10:43:25.186
1938a2e6-bbea-419c-a071-a2f371eadc22	Karadi Briyani	tamilTheriyathu	It is some what spicy	tamilTheriyathu	1000	500	2	9e7a1818-1136-4989-8435-7c1c231ae855	f358e9f6-c2d7-4085-bddb-0fe7e64b4244	2025-07-29 06:14:38.023	2025-07-29 06:15:32.67	e94d4a15-32c7-4445-b11e-0e6a37a79e0a	SERVE	\N	50	50	OUT_OF_STOCK	ACTIVE	0	2025-05-12 10:43:25.186
2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	Chicken Briyani	\N	It is some what spicy	\N	1000	500	2	9e7a1818-1136-4989-8435-7c1c231ae855	f358e9f6-c2d7-4085-bddb-0fe7e64b4244	2025-06-19 09:52:34.959	2025-08-04 10:50:02.282	e94d4a15-32c7-4445-b11e-0e6a37a79e0a	SERVE	\N	50	10	AVAILABLE	ACTIVE	0	\N
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."CartItem" (id, "cartId", "itemId", quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ServiceOption; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ServiceOption" (id, name, "vendorTypeId", "createdAt", "updatedAt", description, "relativeUrl", "serviceOptImageRef") FROM stdin;
9248321f-434c-4938-86fc-baf590096502	Dinein	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	2025-06-05 05:47:53.209	2025-06-05 05:47:53.209	Dinein	\N	\N
61d641f7-13dd-44f0-bf20-76e7c7dd503e	Takeaway	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	2025-06-05 05:47:53.212	2025-06-05 05:47:53.212	Takeaway	\N	\N
5ef3e0ff-98ef-4684-bb08-9fb738f68b52	Two Wheeler Puncture	726f6995-1873-49dd-b500-ec6ec3151e77	2025-06-17 07:51:57.883	2025-06-17 07:51:57.883	It covers Two wheeler size vechicle	./uploads/serviceOption/1750146717881-621078182-Nonveg Shawarma.jpeg	http://localhost:3000/client/serviceOption/1750146717881-621078182-Nonveg Shawarma.jpeg
6307b0ee-583c-4b51-a3b4-6b6bfc8be0a2	Three Wheeler Puncture	726f6995-1873-49dd-b500-ec6ec3151e77	2025-06-17 07:52:02.039	2025-06-17 07:52:02.039	It covers Two wheeler size vechicle	./uploads/serviceOption/1750146722038-941987463-Nonveg Shawarma.jpeg	http://localhost:3000/client/serviceOption/1750146722038-941987463-Nonveg Shawarma.jpeg
747c47a4-91e7-47ae-b369-6c639c85ddad	General Service	726f6995-1873-49dd-b500-ec6ec3151e77	2025-06-17 07:52:12.286	2025-06-17 07:52:12.286	It covers Two wheeler size vechicle	./uploads/serviceOption/1750146732285-931740940-Nonveg Shawarma.jpeg	http://localhost:3000/client/serviceOption/1750146732285-931740940-Nonveg Shawarma.jpeg
016d1ca6-3dd8-40cd-86bf-4ada15e7fea2	Cooler cleaner	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	2025-07-22 13:11:51.723	2025-07-22 13:15:25.137	--	./uploads/serviceOption/1753190125132-756646704-Chicken_shawarma.jpeg	http://localhost:3000/client/serviceOption/1753190125132-756646704-Chicken_shawarma.jpeg
\.


--
-- Data for Name: VendorServiceOption; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."VendorServiceOption" (id, "vendorId", "serviceOptionId", status) FROM stdin;
6b4d50dc-d5f3-44e6-bddd-bd6d7be11616	2df60053-9fbc-4f09-a292-6915fa413b57	61d641f7-13dd-44f0-bf20-76e7c7dd503e	ACTIVE
de103c39-d5b8-438e-a0a7-0c661819473a	9e7a1818-1136-4989-8435-7c1c231ae855	9248321f-434c-4938-86fc-baf590096502	INACTIVE
2fdfc769-dfde-46b4-b544-906492acc77c	9e7a1818-1136-4989-8435-7c1c231ae855	61d641f7-13dd-44f0-bf20-76e7c7dd503e	ACTIVE
d8d961b1-439c-45e7-b1fe-dbd73e7c0651	8cd1b5a8-963c-40c5-a181-b74b90e1bba3	5ef3e0ff-98ef-4684-bb08-9fb738f68b52	ACTIVE
1219aadc-2179-40da-aff2-5f92533621a8	a68cbd24-f192-421b-bd0c-b37612645719	9248321f-434c-4938-86fc-baf590096502	ACTIVE
\.


--
-- Data for Name: CartItemVendorServiceOption; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."CartItemVendorServiceOption" (id, "cartItemId", "vendorServiceOptionId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Disclaimer; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Disclaimer" (id, image, "userType", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DynamicField; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."DynamicField" (id, label, type, "isRequired", pattern, "errorMessage", context, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DynamicSelectOption; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."DynamicSelectOption" (id, "fieldId", value, label) FROM stdin;
\.


--
-- Data for Name: FCMToken; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."FCMToken" (id, "userId", "deviceId", token, "createdAt", "updatedAt") FROM stdin;
2d044124-83d1-4ead-b71f-091abd488931	de14e895-4ece-45f0-90fc-e04695d112da	\N	e7G-kbheQXaI5PtVhVh-JB:APA91bFZUfW2JlO4b_TuEJTYD5-uv-X6XMcnHCrHOc_NhFD7n4qlswuO2z_8OHFhCysYnaPXhUhc3cRh4_Dpdzy5Xn-XHkH25MRJcU7NXY0YOqRcplPqK9c	2025-07-07 12:07:47.7	2025-07-07 12:07:47.7
\.


--
-- Data for Name: FavouriteCustomerForVendor; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."FavouriteCustomerForVendor" (id, "userId", "vendorId", "createdAt", "updatedAt") FROM stdin;
bd5b245a-cf08-4754-bf78-1c8d39021e6e	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	9e7a1818-1136-4989-8435-7c1c231ae855	2025-06-27 05:45:05.084	2025-06-27 05:45:05.084
\.


--
-- Data for Name: FavouriteVendorForCustomer; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."FavouriteVendorForCustomer" (id, "userId", "vendorId", "createdAt", "updatedAt") FROM stdin;
876a8ef6-8f5b-4fca-a9d8-e2ec12d762ea	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	20c3ef80-f5eb-4fb6-b3c5-3405ab0fc58b	2025-06-20 06:22:37.244	2025-06-20 06:22:37.244
\.


--
-- Data for Name: ItemImage; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ItemImage" (id, "relativeUrl", "absoluteUrl", "itemId", "createdAt", "updatedAt") FROM stdin;
3e8042e8-fc80-4882-8999-45602e1b8ee2	./uploads/item/1750326754955-909919761-chicken_gravy_spicy.jpg	http://localhost:3000/client/item/1750326754955-909919761-chicken_gravy_spicy.jpg	2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	2025-06-19 09:52:34.959	2025-06-19 09:52:34.959
b425caf9-481f-4778-81a6-b023262f4e49	./uploads/item/1751634864317-368233115-imag1.jpg	http://localhost:3000/client/item/1751634864317-368233115-imag1.jpg	bed18bf1-88b3-4325-9846-1dfab44d2082	2025-07-04 13:14:24.32	2025-07-04 13:14:24.32
990b0cde-64fc-45fb-bf87-93c2a8937efc	./uploads/item/1753769678020-20082261-ant-rozetsky-io7dX_1EFCg-unsplash.jpg	http://localhost:3000/client/item/1753769678020-20082261-ant-rozetsky-io7dX_1EFCg-unsplash.jpg	1938a2e6-bbea-419c-a071-a2f371eadc22	2025-07-29 06:14:38.023	2025-07-29 06:14:38.023
\.


--
-- Data for Name: keyWord; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."keyWord" (id, name, "vendorTypeId", "keyWordType", status, "createdAt", "updatedAt") FROM stdin;
5423f08f-b227-4ed9-a7bf-4a8b1ac52fcb	NonVeg	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	BANNER	ACTIVE	2025-06-09 08:55:16.47	2025-06-09 08:55:16.47
17d54205-59d8-4f5e-8ab5-4a1492237b6c	Mobile Puncture	726f6995-1873-49dd-b500-ec6ec3151e77	VENDOR_TYPE	ACTIVE	2025-06-17 09:33:45.411	2025-06-17 09:33:45.411
cd3a4310-82f3-44f5-b64d-83920ee8c0c8	Live Puncture	726f6995-1873-49dd-b500-ec6ec3151e77	VENDOR_TYPE	ACTIVE	2025-06-17 09:34:00.339	2025-06-17 09:34:00.339
bf7c279c-28bc-4830-b324-4f01500df1dd	keyword1	487d6baa-d79b-410f-b2c4-993388ab3a19	BANNER	ACTIVE	2025-07-22 14:34:20.072	2025-07-22 14:35:16.326
\.


--
-- Data for Name: KeywordBanner; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."KeywordBanner" (id, "bannerId", "keywordId", "createdAt", "updatedAt") FROM stdin;
01727741-2211-4e73-8abe-cc64c52252a0	4b4629fc-bdb7-4a8a-b1b0-b36357dc2afb	5423f08f-b227-4ed9-a7bf-4a8b1ac52fcb	2025-06-12 08:04:59.921	2025-06-12 08:04:59.921
51c8bda6-66cf-4154-998d-cd1c22c8be5c	f597f61c-61ef-4fe4-b27a-a9652d29bae4	bf7c279c-28bc-4830-b324-4f01500df1dd	2025-08-04 11:01:23.719	2025-08-04 11:01:23.719
ffbfa68d-afc4-479f-b615-7c531a621f50	c32b5e65-ca77-4c12-9eb4-7450b067613b	bf7c279c-28bc-4830-b324-4f01500df1dd	2025-08-13 10:35:01.219	2025-08-13 10:35:01.219
\.


--
-- Data for Name: LicenseCategory; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."LicenseCategory" (id, name, status, "createdAt", "updatedAt") FROM stdin;
1274676d-2823-4dba-b62b-dae8a1709c40	FISSAI	ACTIVE	2025-09-20 09:08:54.18	2025-09-20 09:12:07.408
26258326-bfe4-4593-9e80-1e300ed69177	Urudu	INACTIVE	2025-09-21 15:23:43.139	2025-09-21 15:23:50.266
\.


--
-- Data for Name: ShopCategory; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ShopCategory" (id, name, "vendorTypeId", status, "createdAt", "updatedAt") FROM stdin;
3d189b7b-de99-41c9-a3aa-aae274fe5f76	Thallu vandi	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	ACTIVE	2025-09-20 09:40:39.681	2025-09-20 09:40:39.681
ba8d6c75-94e6-4d5f-8e8b-e9f6293ec2ce	Nalla Vandi	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	ACTIVE	2025-09-20 09:40:51.46	2025-09-20 09:40:51.46
cf64c3d6-2f37-4957-915e-625ebf0fceec	Good Kadal	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	INACTIVE	2025-09-21 16:58:57.267	2025-09-21 16:59:11.828
\.


--
-- Data for Name: ShopCity; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ShopCity" (id, name, "tamilName", status, "createdAt", "updatedAt") FROM stdin;
8af77ab2-e611-475d-8563-acf8992319a6	Erode	\N	ACTIVE	2025-09-20 09:52:04.657	2025-09-20 09:52:04.657
fed0f431-c4ff-463f-9ef0-5ad62807b54c	Namakkal	\N	ACTIVE	2025-09-20 09:52:10.293	2025-09-20 09:52:10.293
a1f9f7e0-be2c-49c4-934b-cb602bfbaa1c	Covai	\N	ACTIVE	2025-09-21 17:10:56.664	2025-09-21 17:10:56.664
\.


--
-- Data for Name: ShopInfo; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ShopInfo" (id, "vendorId", name, "nameTamil", address, "addressTamil", city, "shopCityId", pincode, "shopImageRef", "relativeUrl", "shopType", "shopCategoryId", "istermsAccepted", latitude, longitude, "dynamicValues", "createdAt", "updatedAt", "isShopOpen", location) FROM stdin;
413e4918-9fcb-4348-a917-8c6f4872d728	8cd1b5a8-963c-40c5-a181-b74b90e1bba3	Service Vendor Aani kadai	\N	thiruttu veethi	\N	Erode	\N	641669	http://localhost:3000/client/shops/1750152871085-602904567-Dosa.jpg	./uploads/shops/1750152871085-602904567-Dosa.jpg	\N	\N	f	40.712776	-74.005974	\N	2025-06-17 09:34:31.089	2025-06-17 09:34:31.089	f	\N
cc6e49aa-a5d7-4e5f-8398-c54ce7fcc90a	9e7a1818-1136-4989-8435-7c1c231ae855	ProductVendor Shop	\N	Product vendor address	\N	Product vendor City	\N	641671	\N	\N	\N	\N	f	10.123456	77.654321	\N	2025-06-05 05:47:53.218	2025-06-18 12:40:27.773	t	0101000020E610000081053065E06953406DFDF49F353F2440
99c09b79-8633-48eb-9038-3343c67b2db3	20c3ef80-f5eb-4fb6-b3c5-3405ab0fc58b	Service Vendor Shop	\N	Service vendor address	\N	Service vendor City	\N	641672	\N	\N	\N	\N	f	10.123456	77.654321	\N	2025-06-05 05:47:53.213	2025-06-20 05:26:08.281	t	\N
9985bacf-2e4a-45c2-8cc1-39ace8b927d9	2df60053-9fbc-4f09-a292-6915fa413b57	Product Vendor thallu vandi kadai	\N	thiruttu veethi	\N	Erode	\N	641669	http://localhost:3000/client/shops/1752646159997-575429260-shop (1).png	./uploads/shops/1752646159997-575429260-shop (1).png	\N	\N	f	40.712776	-74.005974	\N	2025-07-16 05:48:20.931	2025-07-16 06:09:20.006	f	0101000020E610000015A8C5E0618052C0D5AF743E3C5B4440
7e0f5de9-590f-4886-998a-a5fd27c35d5d	7a6a64b3-05b9-4a19-b338-89fec006450f	Banner Vandi kadai	\N	thiruttu veethi	\N	Erode	\N	641669	http://localhost:3000/client/shops/1754305041871-181660420-App Store - Chat History page screeshot (1).jpg	./uploads/shops/1754305041871-181660420-App Store - Chat History page screeshot (1).jpg	\N	\N	f	40.712776	-74.005974	\N	2025-08-04 10:57:21.876	2025-08-04 10:57:21.876	f	0101000020E610000015A8C5E0618052C0D5AF743E3C5B4440
2819f60b-0e34-4f2f-a1db-ae1971f410db	a68cbd24-f192-421b-bd0c-b37612645719	KK Shop	\N	Vinu Stree,Erode	\N	Erode	\N	641671	http://localhost:3000/client/shops/1754992667222-74017269-App Store - Chat History page screeshot (2).jpg	./uploads/shops/1754992667222-74017269-App Store - Chat History page screeshot (2).jpg	CART	\N	f	40.712776	-74.005974	\N	2025-08-12 10:01:21.979	2025-08-12 10:01:21.979	f	0101000020E610000015A8C5E0618052C0D5AF743E3C5B4440
\.


--
-- Data for Name: License; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."License" (id, "licenseNo", "expiryDate", "relativeUrl", image, "licenseType", "licenseCategoryId", "shopInfoId", "isLicenseApproved", "createdAt", "updatedAt") FROM stdin;
91de7dcc-e506-4528-8b0e-fa9bd29ad0ed	123456789	2026-05-13 08:46:14	./uploads/license/1752646159998-397960719-image2.jpeg	http://localhost:3000/client/license/1752646159998-397960719-image2.jpeg	FISSAI	\N	9985bacf-2e4a-45c2-8cc1-39ace8b927d9	t	2025-07-16 05:48:20.931	2025-07-18 07:47:51.06
9f3d5f99-4f1f-4ec3-a121-cc7a2cae9c2f	12345678	2026-05-13 08:46:14	\N	\N	FISSAI	\N	413e4918-9fcb-4348-a917-8c6f4872d728	f	2025-06-17 09:34:31.089	2025-07-18 07:47:57.228
38890b60-c587-4d2a-a842-eea7315888f2	1234567891231	2026-05-13 08:46:14	./uploads/license/1754305041871-299171091-dine (1).png	http://localhost:3000/client/license/1754305041871-299171091-dine (1).png	FISSAI	1274676d-2823-4dba-b62b-dae8a1709c40	7e0f5de9-590f-4886-998a-a5fd27c35d5d	f	2025-08-04 10:57:21.876	2025-08-04 10:57:21.876
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Payment" (id, "juspayOrderId", "orderId", amount, purpose, "referenceId", status, "userId", "paymentPageExpiry", "paymentLinkWeb", "juspayTxnId", "gatewayTxnUuid", "gatewayId", gateway, status_id, auth_type, "paymentMethod", "cardLast4", "cardType", "cardBrand", "cardIssuerCountry", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ManualRefund; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ManualRefund" (id, "paymentId", status, amount, "userId", attachment, reason, notes, "metaData", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OTP; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."OTP" (id, "sessionId", "userId", "fcmToken", role, "expiresAt", status, "createdAt", "updatedAt") FROM stdin;
95af3a6b-db2b-4719-b5de-76e3604f91d0	otp_eyJpbnRlZ3JhdGlvbklkIjoiYnllU3lrNkNJY0pCRFB6YUgxRmN6U3RLWVloaDJxbVpmelp6dFE1d3U5VmJ5NmdSVnlEU3N5aEcxUEJVUXJzYk5JNW9FNG1qcUtsRkhLRmltc3A3RFR4dGpjQkx1clo3djAiLCJjbGllbnRUeXBlIjoiTU9CSUxFIiwidGltZXN0YW1wIjoxNzU0MDMxNzAzMTY0LCJjb3VudGVyIjo2OTc3MTg1MzE5NTcyMDY4LCJlbnRyb3B5IjoiN2RjYmM5NDUxOWM3NWJhOTk5ZDQ5OGM2YTAyYTgwMjUwMmRjYjhmODc2YWE5MTZiOGNiN2RjYjliNGM1ZTVkNyIsIm1ldGFkYXRhIjp7Im9yaWdpbmFsU2Vzc2lvbklkIjoib3RwXzE3NTQwMzE3MDFfb1YxZnZDZDFsR0FwRlpJMTFKWnhBRlBGSGRIZEJhUE4iLCJwaG9uZU51bWJlciI6Iis5MTk3ODc2NTI2MjYiLCJyZXF1ZXN0VGltZSI6IjIwMjUtMDgtMDFUMDc6MDE6NDMuMTY0WiJ9fQ.2e0d1a1570669dfd	86f25261-13da-4d9c-8727-945357cfabd5	\N	VENDOR	2025-08-01 07:11:41.442	VERIFIED	2025-08-01 07:01:43.32	2025-08-01 07:05:34.433
ed1a6783-2b63-415c-a827-ad49411e0266	otp_eyJpbnRlZ3JhdGlvbklkIjoiYnllU3lrNkNJY0pCRFB6YUgxRmN6U3RLWVloaDJxbVpmelp6dFE1d3U5VmJ5NmdSVnlEU3N5aEcxUEJVUXJzYk5JNW9FNG1qcUtsRkhLRmltc3A3RFR4dGpjQkx1clo3djAiLCJjbGllbnRUeXBlIjoiTU9CSUxFIiwidGltZXN0YW1wIjoxNzU0MDMzNjU5MjY0LCJjb3VudGVyIjo2OTc5MTQxNDE4OTMxNjY5LCJlbnRyb3B5IjoiMGFmYWY1YTUyODk0YjllNGQ0NWQwOTJhZmI0NTM4ZjVmNTRmY2ZmZjMzNjlhNjdkZGZiOTgwN2NlM2M0ZWY4ZSIsIm1ldGFkYXRhIjp7Im9yaWdpbmFsU2Vzc2lvbklkIjoib3RwXzE3NTQwMzM2NTZfU1hyZW1HZWx5RkdiSkJXUGFTalhENExiUExrMTY2YmMiLCJwaG9uZU51bWJlciI6Iis5MTk3ODc2NTI2MjYiLCJyZXF1ZXN0VGltZSI6IjIwMjUtMDgtMDFUMDc6MzQ6MTkuMjYzWiJ9fQ.2cd8dc46bab92109	86f25261-13da-4d9c-8727-945357cfabd5	\N	VENDOR	2025-08-01 07:44:16.438	PENDING	2025-08-01 07:34:19.185	2025-08-01 07:34:19.185
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Order" (id, "preferredPaymentMethod", "userId", "declineType", "declinedBy", "bannerId", "bannerOfferType", "bannerOfferValue", "bannerTitle", "expiryAt", "finalPayableAmount", "totalPrice", "orderId", "orderStatus", "createdAt", "updatedAt") FROM stdin;
da969f6c-6f73-4824-87cc-3f4265b2b8db	CASH	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	SYSTEM	\N	\N	\N	\N	\N	2025-06-19 09:57:28.065	5000	10000	OD25060001	CANCELLED	2025-06-19 09:56:28.084	2025-06-19 09:58:00.028
2e434b7f-ab23-4599-947e-a87c7f10dd72	CASH	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	SYSTEM	\N	\N	\N	\N	\N	2025-07-07 12:08:25.402	5000	10000	OD25070001	CANCELLED	2025-07-07 12:07:25.422	2025-07-07 12:09:00.011
93fc456c-0e71-41b0-b9ff-6bb7f049e22d	CASH	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	SYSTEM	\N	\N	\N	\N	\N	2025-07-07 12:08:40.745	5000	10000	OD25070002	CANCELLED	2025-07-07 12:07:40.75	2025-07-07 12:09:00.011
186cff70-b2df-48d0-9633-2bf1eaf41a60	CASH	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	SYSTEM	\N	\N	\N	\N	\N	2025-07-07 12:08:43.407	5000	10000	OD25070003	CANCELLED	2025-07-07 12:07:43.414	2025-07-07 12:09:00.011
0cf5c679-55c4-4195-827c-5660fb61e212	CASH	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	SYSTEM	\N	\N	\N	\N	\N	2025-07-07 12:08:47.696	5000	10000	OD25070004	CANCELLED	2025-07-07 12:07:47.7	2025-07-07 12:09:00.011
7e27d304-883a-461a-ab88-972642983bb0	CASH	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	\N	\N	\N	\N	\N	\N	2025-07-15 11:23:21.38	5000	10000	OD25070005	COMPLETED	2025-07-15 11:22:21.398	2025-07-15 11:23:06.405
aa6d2edd-dd14-4efc-bfe3-b75a6303d489	CASH	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	SYSTEM	\N	\N	\N	\N	\N	2025-07-29 06:10:17.878	5000	10000	OD250729001	CANCELLED	2025-07-29 06:09:17.901	2025-07-29 06:11:00.01
11ba9ed5-eb03-4984-a5ae-ab89b0fe2f5f	CASH	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	SYSTEM	\N	\N	\N	\N	\N	2025-07-29 06:10:34.112	5000	10000	OD250729002	CANCELLED	2025-07-29 06:09:34.116	2025-07-29 06:11:00.01
a6f24534-a43e-402d-8927-621920366ec0	CASH	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	\N	\N	\N	\N	\N	\N	2025-08-04 10:51:02.274	5000	10000	OD250804001	DELIVERED	2025-08-04 10:50:02.293	2025-08-04 10:53:25.208
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."OrderItem" (id, "orderId", "itemId", "quantityUnit", quantity, price, "discountPrice", "createdAt", "updatedAt") FROM stdin;
f468da06-91ad-4223-a753-dbcf4bed6fd8	da969f6c-6f73-4824-87cc-3f4265b2b8db	2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	SERVE	10	1000	500	2025-06-19 09:56:28.084	2025-06-19 09:56:28.084
2d044124-83d1-4ead-b71f-091abd488931	2e434b7f-ab23-4599-947e-a87c7f10dd72	2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	SERVE	10	1000	500	2025-07-07 12:07:25.422	2025-07-07 12:07:25.422
fe40ef9b-34ed-4803-aeb8-3b3388436e9e	93fc456c-0e71-41b0-b9ff-6bb7f049e22d	2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	SERVE	10	1000	500	2025-07-07 12:07:40.75	2025-07-07 12:07:40.75
d3ddc691-3170-4926-9cce-e3b92f14a040	186cff70-b2df-48d0-9633-2bf1eaf41a60	2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	SERVE	10	1000	500	2025-07-07 12:07:43.414	2025-07-07 12:07:43.414
ac51e1e7-894d-4e8b-83df-ca6fdaf97021	0cf5c679-55c4-4195-827c-5660fb61e212	2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	SERVE	10	1000	500	2025-07-07 12:07:47.7	2025-07-07 12:07:47.7
cab9cd0b-e511-4a32-8367-02e8d6580d2f	7e27d304-883a-461a-ab88-972642983bb0	2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	SERVE	10	1000	500	2025-07-15 11:22:21.398	2025-07-15 11:22:21.398
5f2265e1-62d4-4cc8-bf47-5b81739d4e09	aa6d2edd-dd14-4efc-bfe3-b75a6303d489	2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	SERVE	10	1000	500	2025-07-29 06:09:17.901	2025-07-29 06:09:17.901
d49cb468-3741-4799-a281-8a8081d07512	11ba9ed5-eb03-4984-a5ae-ab89b0fe2f5f	2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	SERVE	10	1000	500	2025-07-29 06:09:34.116	2025-07-29 06:09:34.116
306dccc4-2e5c-4462-892a-397ce4beaf68	a6f24534-a43e-402d-8927-621920366ec0	2fc9fcbb-f74a-4ed4-81a2-4a2e93182766	SERVE	10	1000	500	2025-08-04 10:50:02.293	2025-08-04 10:50:02.293
\.


--
-- Data for Name: OrderItemVendorServiceOption; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."OrderItemVendorServiceOption" (id, "cartItemId", "vendorServiceOptionId", "createdAt", "updatedAt") FROM stdin;
9773cd60-9b80-4e45-9c3d-3f868f69092e	306dccc4-2e5c-4462-892a-397ce4beaf68	2fdfc769-dfde-46b4-b544-906492acc77c	2025-08-04 10:50:02.293	2025-08-04 10:50:02.293
306dccc4-2e5c-4462-892a-397ce4beaf68	2d044124-83d1-4ead-b71f-091abd488931	6b4d50dc-d5f3-44e6-bddd-bd6d7be11616	2025-08-04 10:50:02.293	2025-08-04 10:50:02.293
2d044124-83d1-4ead-b71f-091abd488931	5f2265e1-62d4-4cc8-bf47-5b81739d4e09	6b4d50dc-d5f3-44e6-bddd-bd6d7be11616	2025-08-04 10:50:02.293	2025-08-04 10:50:02.293
\.


--
-- Data for Name: Wallet; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Wallet" (id, "userId", balance, locked, "lockedBalance", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WalletTransaction; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."WalletTransaction" (id, "senderWalletId", "receiverWalletId", amount, "transactionType", reason, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderPayment; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."OrderPayment" (id, "orderId", "paymentId", "walletTransactionId", type, "paidedAmount", status, "createdAt", "updatedAt") FROM stdin;
a6f24534-a43e-402d-8927-621920366ec0	aa6d2edd-dd14-4efc-bfe3-b75a6303d489	\N	\N	JUSPAY	3000	COMPLETED	2025-08-04 10:50:02.293	2025-08-04 10:50:02.293
306dccc4-2e5c-4462-892a-397ce4beaf68	2e434b7f-ab23-4599-947e-a87c7f10dd72	\N	\N	JUSPAY	1000	COMPLETED	2025-08-05 10:50:02.293	2025-08-04 10:50:02.293
2e434b7f-ab23-4599-947e-a87c7f10dd72	a6f24534-a43e-402d-8927-621920366ec0	\N	\N	JUSPAY	2000	COMPLETED	2025-08-04 23:50:02.293	2025-08-04 10:50:02.293
\.


--
-- Data for Name: OrderSettlement; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."OrderSettlement" (id, "vendorId", date, amount, status, "proofImage", "createdAt", "updatedAt") FROM stdin;
2e434b7f-ab23-4599-947e-a87c7f10dd72	2df60053-9fbc-4f09-a292-6915fa413b57	2025-08-04 00:00:00	3000	PAID	\N	2025-08-04 10:50:02.293	2025-08-04 10:50:02.293
\.


--
-- Data for Name: PaymentErrorLog; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."PaymentErrorLog" (id, "referenceId", "vendorUserId", purpose, "customerUserId", "errorType", message, "metaData", "createdAt") FROM stdin;
\.


--
-- Data for Name: Poster; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Poster" (id, file, heading, status, "createdAt", "updatedAt") FROM stdin;
34cc5a67-e396-4b60-b66b-0aae6e5603c3	/Users/rithi/Desktop/Arunkumar/project/erowayz_uploads/poster/1758540326137-590544480-Vesti.pic.png	This is new poster	ACTIVE	2025-09-22 11:25:26.141	2025-09-22 11:25:26.141
\.


--
-- Data for Name: PreDefinedBanner; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."PreDefinedBanner" (id, name, title, "subHeading", description, "userId", "bgImageRef", "bgImageRelativeUrl", "bgColor", "fgImageRef", "fgImageRelativeUrl", "textColor", "offerType", "offerValue", "minApplyValue", status, "createdAt", "updatedAt") FROM stdin;
aef0d123-a7f1-4183-b600-dcd1f8393e99	30% offer	Hello	Product sub heading	Product Description	62c5b3a3-5ae5-4549-a46a-c875b725aff6	\N	\N	#1703fc	http://localhost:3000/client/banner/1749715041385-275029496-20250426_185541.jpg	./uploads/banner/1749715041385-275029496-20250426_185541.jpg	#f0efe4	PERCENTAGE	25	400	ACTIVE	2025-06-12 07:57:21.386	2025-06-12 07:58:13.277
\.


--
-- Data for Name: PrivacyPolicy; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."PrivacyPolicy" (id, image, "userType", "createdAt", "updatedAt") FROM stdin;
25c06dc5-a3ed-4610-8451-1aca6ae4fab7	/Users/rithi/Desktop/Arunkumar/project/erowayz_uploads/privacyPolicy/1758536834625-513932513-sample2.html	VENDOR	2025-09-22 10:27:14.627	2025-09-22 10:27:14.627
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."RefreshToken" (id, "userId", token, "expiresAt", "createdAt") FROM stdin;
9ec0e00a-c693-4ee6-9f58-a54756b6a560	b98b1997-e541-41fb-b143-ecda3d051aae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiOThiMTk5Ny1lNTQxLTQxZmItYjE0My1lY2RhM2QwNTFhYWUiLCJ1dWlkIjoiNGUxOTQ3OWMtNzhhZS00Mjc0LWEyZWUtMDkyNDQ0NzRkY2U4IiwiaWF0IjoxNzQ5NTQ2ODAxLCJleHAiOjE3NTIxMzg4MDF9.7Bv9emF9iPVMbHeorLjUIsaWztDeel_-RgYhVupLNWE	2025-07-10 09:13:21.736	2025-06-10 09:13:21.739
8f880e73-4def-473d-a833-9f4458d25b38	f20362b6-0f43-4b85-8d82-03439afbd98c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjAzNjJiNi0wZjQzLTRiODUtOGQ4Mi0wMzQzOWFmYmQ5OGMiLCJ1dWlkIjoiMzc2NjEzYmItNTE3Ni00NTAxLWI4N2UtMzUyNTQyYWM0ODkyIiwiaWF0IjoxNzQ5NTQ3MDI4LCJleHAiOjE3NTIxMzkwMjh9.yXvErYouQMOvEkdGafiCEQwVKku2wJuHdbRZlC1fW0U	2025-07-10 09:17:08.057	2025-06-10 09:17:08.059
9e3fea52-5b6c-444b-95b7-5f8f273267b5	5352645c-7749-4af0-bd27-5b4ac3dfcc79	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MzUyNjQ1Yy03NzQ5LTRhZjAtYmQyNy01YjRhYzNkZmNjNzkiLCJ1dWlkIjoiYWRkOWNkOWEtYTJmMy00NmRlLThmZWYtMzZmMTZlYzlmMWE0IiwiaWF0IjoxNzQ5NTQ3MDYwLCJleHAiOjE3NTIxMzkwNjB9.rdJKsX0uYjSgTuoYs8F-2hIJWmwwfyreDjQnvNIhZs4	2025-07-10 09:17:40.841	2025-06-10 09:17:40.843
ed876802-aacf-41c2-881d-4d1140a755b8	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzdiMzMyMy0wMDhlLTRkOWQtOWZlMy03ZDRiODg2N2Q2M2IiLCJ1dWlkIjoiMGZlZmZhMDQtNGUzMy00ZWRhLTk0YjMtMjlkMjUzNjcxNDkyIiwiaWF0IjoxNzQ5NTQ3Nzg1LCJleHAiOjE3NTIxMzk3ODV9.pY0a9k7izS8_OqJnrI0tMbEDYsir1fX6Gj5B6hWByVw	2025-07-10 09:29:45.322	2025-06-10 09:29:45.323
4477bfd5-475f-42eb-ab42-aca118298550	f02d79a1-4b31-46e9-a6e5-df4b3cc6fc39	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDJkNzlhMS00YjMxLTQ2ZTktYTZlNS1kZjRiM2NjNmZjMzkiLCJ1dWlkIjoiNzczZDI5NDYtYmMxNi00YmEyLWI5M2YtNDJiMDA5NjIxMThlIiwiaWF0IjoxNzUwMTUyODcxLCJleHAiOjE3NTI3NDQ4NzF9.sW_kKs0bxBzZV7naE0y7US-8Y17MdfPDU6epV5OHnzk	2025-07-17 09:34:31.118	2025-06-17 09:34:31.119
aea238ad-b248-4b07-9ed3-6cf7aea4f413	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzdiMzMyMy0wMDhlLTRkOWQtOWZlMy03ZDRiODg2N2Q2M2IiLCJ1dWlkIjoiYjRmMWQ1ZDQtODc3MS00Y2MzLWIxNTEtYTE5ZjE5YWJlODM1IiwiaWF0IjoxNzUwMTU5OTA5LCJleHAiOjE3NTI3NTE5MDl9.TmQVgrjd9Tc4TVnxrgJ3ezIRjSYVyhmFg2AIOfY47ak	2025-07-17 11:31:49.059	2025-06-17 11:31:49.06
fbb851ac-524c-4e44-9413-bd7e3a190dd6	cc4e0b37-7f33-4e50-8524-784c12e3aed6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzRlMGIzNy03ZjMzLTRlNTAtODUyNC03ODRjMTJlM2FlZDYiLCJ1dWlkIjoiZThmZmU1ZWItZTk2OS00OWZhLTkxODAtMGZmMjk5ZmFmODg5IiwiaWF0IjoxNzUwMjUwNDA2LCJleHAiOjE3NTI4NDI0MDZ9.LcxPwow5qrDefqcqWMpbb_L4MQLZ3qRuS830ZrmLRs8	2025-07-18 12:40:06.677	2025-06-18 12:40:06.678
c9e3f570-eb3e-414b-91dc-50bb15eb1531	cc4e0b37-7f33-4e50-8524-784c12e3aed6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzRlMGIzNy03ZjMzLTRlNTAtODUyNC03ODRjMTJlM2FlZDYiLCJ1dWlkIjoiMTE2MDhkZmYtOWFiMy00NTNkLWI5NjgtNjRlYjNiYmI2ZjFkIiwiaWF0IjoxNzUwMzI1ODQxLCJleHAiOjE3NTI5MTc4NDF9.Lg2pFvvztaUSurei8iNM74vWbHYCJIYvPhVXSxu65to	2025-07-19 09:37:21.458	2025-06-19 09:37:21.46
cb5f9dbb-ba6b-4d0b-a8fa-03c236fa651d	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzdiMzMyMy0wMDhlLTRkOWQtOWZlMy03ZDRiODg2N2Q2M2IiLCJ1dWlkIjoiZmNhYzU0ZDktODE1NS00NThhLWFjNTktNWM0MjUzZTFmOGRmIiwiaWF0IjoxNzUwMzI1ODY2LCJleHAiOjE3NTI5MTc4NjZ9.CHmJbQfeWf1LS6EGaBpAC57WBhzi5KDk38lktpRlgK4	2025-07-19 09:37:46.242	2025-06-19 09:37:46.244
c7dc3bce-700d-4657-99d3-4ef97d7597e7	62c5b3a3-5ae5-4549-a46a-c875b725aff6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmM1YjNhMy01YWU1LTQ1NDktYTQ2YS1jODc1YjcyNWFmZjYiLCJ1dWlkIjoiNWI5ZjZjZDAtMGZiNy00OGYwLTlkNGYtMWRlODFiYTExNGMyIiwiaWF0IjoxNzUwMzI2NDk3LCJleHAiOjE3NTI5MTg0OTd9.pLZZuFSb7HGr-NlWIFbVUFPDkKqJjg5MblqoVjj5v7s	2025-07-19 09:48:17.666	2025-06-19 09:48:17.667
81d0ea34-207e-4c4d-b69e-9a31fe973b9d	266673fd-7155-4951-a32a-5bb788382e5a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjY2NzNmZC03MTU1LTQ5NTEtYTMyYS01YmI3ODgzODJlNWEiLCJ1dWlkIjoiMzAyZGZjODItN2I2MC00Yjk5LWIzMDItYzBlY2YxYTc5Mzk4IiwiaWF0IjoxNzUwMzUyNjM3LCJleHAiOjE3NTI5NDQ2Mzd9.5Z78p7LuQH6jn7Fgvok-5glnldTQvz1aRuz2heBhSks	2025-07-19 17:03:57.499	2025-06-19 17:03:57.504
27b419c8-e66a-4530-861c-43b5aa95c0e8	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzdiMzMyMy0wMDhlLTRkOWQtOWZlMy03ZDRiODg2N2Q2M2IiLCJ1dWlkIjoiMjVlM2M2YzItNDM2OS00N2MxLTk1Y2YtMzUyNzA0NzM2M2Q0IiwiaWF0IjoxNzUwMzk2NDg0LCJleHAiOjE3NTI5ODg0ODR9.JnwPN7SqxpZebzC5lmMyv6E-GAaaa5hTCnJFAejpVu4	2025-07-20 05:14:44.115	2025-06-20 05:14:44.117
2dcbb46f-8412-4e99-84b9-bcbab0946aa9	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzdiMzMyMy0wMDhlLTRkOWQtOWZlMy03ZDRiODg2N2Q2M2IiLCJ1dWlkIjoiZjhiYjRkZTMtNGJjZi00MGI1LTk0ZTctZGNiYzMzOTgwOTk1IiwiaWF0IjoxNzUxMDAxMzE4LCJleHAiOjE3NTM1OTMzMTh9.YOC1ROiO4bcJ1bISWP5JC-dM8HKJS2XtXw8K9WH4iG8	2025-07-27 05:15:18.147	2025-06-27 05:15:18.149
ab383166-f9ac-439d-9cb0-bb994f468661	b98b1997-e541-41fb-b143-ecda3d051aae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiOThiMTk5Ny1lNTQxLTQxZmItYjE0My1lY2RhM2QwNTFhYWUiLCJ1dWlkIjoiMjc4Yzk2ZGMtZTZlOC00ZDk4LThhODktMDM2ZWY1MzI4NjY1IiwiaWF0IjoxNzUxMDAxNjI0LCJleHAiOjE3NTM1OTM2MjR9.yI1rwlbSKG3qgVWgxVHR3To6ZaV2jKj_H2ddRryMqgY	2025-07-27 05:20:24.862	2025-06-27 05:20:24.863
6956ebf0-4409-4953-bf26-dfeceb9d4282	cc4e0b37-7f33-4e50-8524-784c12e3aed6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzRlMGIzNy03ZjMzLTRlNTAtODUyNC03ODRjMTJlM2FlZDYiLCJ1dWlkIjoiNzRkZjZkNDYtNjc1NC00MzJlLWI3NGItNTIyMWM2ZTUyYjc0IiwiaWF0IjoxNzUxMDAyOTI0LCJleHAiOjE3NTM1OTQ5MjR9.RgKhjwqNRUtJ1LzHDnyrITXSvGb_JC8FHV7bpjIZxBM	2025-07-27 05:42:04.09	2025-06-27 05:42:04.091
db9760cc-efce-406e-892f-b01e1aa97dde	cc4e0b37-7f33-4e50-8524-784c12e3aed6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzRlMGIzNy03ZjMzLTRlNTAtODUyNC03ODRjMTJlM2FlZDYiLCJ1dWlkIjoiZmQ4NzY4ODktZTI0MS00NDIyLTlkOTgtMGQ3OTUxODU2YmQ4IiwiaWF0IjoxNzUxNjM0NzgzLCJleHAiOjE3NTQyMjY3ODN9.1sltHkJuDu1I0rIHDHkDs0NLOiMb002-_oq-W5_AKiI	2025-08-03 13:13:03.337	2025-07-04 13:13:03.341
770497a3-a1af-465b-97c3-f65f845f6083	62c5b3a3-5ae5-4549-a46a-c875b725aff6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmM1YjNhMy01YWU1LTQ1NDktYTQ2YS1jODc1YjcyNWFmZjYiLCJ1dWlkIjoiMzU1NzVhNTctMDU5ZS00NDU5LWJhMmMtZjM2OWNlMmQ2ZDBhIiwiaWF0IjoxNzUxNjkyOTI5LCJleHAiOjE3NTQyODQ5Mjl9.6f7hTJVMtDpMOzbJW_7tFX9DJFOFyj3Q9zLYrqdOiA8	2025-08-04 05:22:09.195	2025-07-05 05:22:09.196
3b81ef59-d05f-42d3-9702-a084098f180f	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzdiMzMyMy0wMDhlLTRkOWQtOWZlMy03ZDRiODg2N2Q2M2IiLCJ1dWlkIjoiOTI3ZWFkYTItYjJjMy00MzRjLWI0MzUtMzY2NjAxOTM0NGUxIiwiaWF0IjoxNzUxNjk2Njc2LCJleHAiOjE3NTQyODg2NzZ9.on-U8uyRAlotDeUlL6YtEWgYb0Eddhb2ueLNjW6YLzw	2025-08-04 06:24:36.462	2025-07-05 06:24:36.465
66a40896-352c-47f4-a59f-4eac73bfbdb6	266673fd-7155-4951-a32a-5bb788382e5a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjY2NzNmZC03MTU1LTQ5NTEtYTMyYS01YmI3ODgzODJlNWEiLCJ1dWlkIjoiNzgxZjkzMzctNjNjOC00ZjgwLTk3NzAtMGFjMjJmNjY0OGJlIiwiaWF0IjoxNzUxNjk3MDQ3LCJleHAiOjE3NTQyODkwNDd9.hsiBEzTcNM-ZVXw1MEeME8aDR0p-I_olCVE4NwL3NIo	2025-08-04 06:30:47.244	2025-07-05 06:30:47.245
d02a6b99-e24c-458c-8ccc-869e4e3a6a4f	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzdiMzMyMy0wMDhlLTRkOWQtOWZlMy03ZDRiODg2N2Q2M2IiLCJ1dWlkIjoiYjUxYzJkN2UtMmE4MC00MTA1LWIwMTgtMDFkZTY1MjViNTRkIiwiaWF0IjoxNzUxODg5OTczLCJleHAiOjE3NTQ0ODE5NzN9._bpNfHyivgYgVF2H0TCaoCHw2NKNaJUuTD8-r7McwJ8	2025-08-06 12:06:13.542	2025-07-07 12:06:13.544
9a649417-c8fc-48fb-8c19-4c53bd13ed43	cc4e0b37-7f33-4e50-8524-784c12e3aed6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzRlMGIzNy03ZjMzLTRlNTAtODUyNC03ODRjMTJlM2FlZDYiLCJ1dWlkIjoiMTNlZmM1NTgtZjFhZi00NGY3LWI5OTQtNWU5OTk4M2Y4ZjIzIiwiaWF0IjoxNzUyNTc2MjQ5LCJleHAiOjE3NTUxNjgyNDl9.EggTpCCSbooI6S4gsbpG_w7K3rXc8tgmc2A4Z1nblFE	2025-08-14 10:44:09.267	2025-07-15 10:44:09.27
fa2fe1ef-d4d9-4ead-909a-72a4662382c1	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzdiMzMyMy0wMDhlLTRkOWQtOWZlMy03ZDRiODg2N2Q2M2IiLCJ1dWlkIjoiZGU4MmNkYjEtYWNjYS00MGE1LTlmZjEtZmU4MWMwMzljZjllIiwiaWF0IjoxNzUyNTc4MzgxLCJleHAiOjE3NTUxNzAzODF9.C4qfTsSEbMc77GGX66bA5V7EjUseob0J37v0BbqAjhk	2025-08-14 11:19:41.678	2025-07-15 11:19:41.68
6cef5f4c-074e-45ab-95b1-636d50bdbd75	86f25261-13da-4d9c-8727-945357cfabd5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NmYyNTI2MS0xM2RhLTRkOWMtODcyNy05NDUzNTdjZmFiZDUiLCJ1dWlkIjoiMzBlYTA3ZjktNGE2Ni00NDhjLTkwZjQtYzc3ZWE5N2QxYmEyIiwiaWF0IjoxNzUyNjQ0OTAxLCJleHAiOjE3NTUyMzY5MDF9.NxEBAiEVVOIQoKetszQ-KZSMoezgpJN4YhjIbFHbJ00	2025-08-15 05:48:21.082	2025-07-16 05:48:21.083
0e021384-b833-414a-9f1b-e3c93c48b046	62c5b3a3-5ae5-4549-a46a-c875b725aff6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmM1YjNhMy01YWU1LTQ1NDktYTQ2YS1jODc1YjcyNWFmZjYiLCJ1dWlkIjoiNWNlZTg0NDAtMzE1MS00OWYzLWIyOTgtOGYzZjJhYmUzODg2IiwiaWF0IjoxNzUyNjc4OTI2LCJleHAiOjE3NTUyNzA5MjZ9.JGz1mX5s68Xn2_jD1N38dyR9uqnPFDf7767hsI7VTKg	2025-08-15 15:15:26.633	2025-07-16 15:15:26.634
98855d2a-4d4d-4d8b-8ed2-b48d833f63c3	62c5b3a3-5ae5-4549-a46a-c875b725aff6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmM1YjNhMy01YWU1LTQ1NDktYTQ2YS1jODc1YjcyNWFmZjYiLCJ1dWlkIjoiYjYwZmQ2NzctOWM2NC00NjAyLWIxY2UtODlmYjZhZjk1ZDdmIiwiaWF0IjoxNzUyNzMxNzM2LCJleHAiOjE3NTUzMjM3MzZ9.lYyQ4h6rtoNlxmKte13CYORiow2ycyYhsfhhZtZFzAE	2025-08-16 05:55:36.851	2025-07-17 05:55:36.856
7d6cc4ad-093b-485b-b396-73d48f6550d1	62c5b3a3-5ae5-4549-a46a-c875b725aff6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmM1YjNhMy01YWU1LTQ1NDktYTQ2YS1jODc1YjcyNWFmZjYiLCJ1dWlkIjoiMTM3NjJhYmEtNjllMi00YjE3LWE0MDctNTM5ZDAwYmU3Yzg3IiwiaWF0IjoxNzUyNzcwNjY2LCJleHAiOjE3NTUzNjI2NjZ9.SMraofQzxMQnywObvfHoyGZDxjh7VF5GLvAVq7mnhxI	2025-08-16 16:44:26.998	2025-07-17 16:44:26.999
c1e7c39d-233c-4f54-bac6-3b23c0492692	62c5b3a3-5ae5-4549-a46a-c875b725aff6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmM1YjNhMy01YWU1LTQ1NDktYTQ2YS1jODc1YjcyNWFmZjYiLCJ1dWlkIjoiMjQwNTMyNDItYjU4OC00NWMyLWI0NTUtZjVmMmQ0YzdhZDJiIiwiaWF0IjoxNzUyODE5NTAwLCJleHAiOjE3NTU0MTE1MDB9.NMrXQ59PbCPoTD8iak8UjPLnJ3YzmZxgzrq6E8cfAok	2025-08-17 06:18:20.21	2025-07-18 06:18:20.212
dc2f14e5-b430-410b-bb60-05e6165a5be8	62c5b3a3-5ae5-4549-a46a-c875b725aff6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmM1YjNhMy01YWU1LTQ1NDktYTQ2YS1jODc1YjcyNWFmZjYiLCJ1dWlkIjoiN2Q3NWRhOWMtNjZiMS00Y2Y1LTgxNjAtZTljNDJiYTVjMDQ4IiwiaWF0IjoxNzUzMTgxNDQ5LCJleHAiOjE3NTU3NzM0NDl9.cKr4d93EIVyvX444CLSiWBIYP3_VmCMR5OA0EfRMp1Y	2025-08-21 10:50:49.216	2025-07-22 10:50:49.221
dfe25512-26e9-42ba-bb91-b8264cbc0c5c	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzdiMzMyMy0wMDhlLTRkOWQtOWZlMy03ZDRiODg2N2Q2M2IiLCJ1dWlkIjoiZTZlOGMxZGQtNGQ3ZS00YjA1LTk0ODUtNmU4YjRlNzU0Zjc4IiwiaWF0IjoxNzUzNzY5MjYwLCJleHAiOjE3NTYzNjEyNjB9.Wy4z1GbHO4LfEQ_aLQazuWGIJYV8NunqkjVpRnn2MAk	2025-08-28 06:07:40.851	2025-07-29 06:07:40.853
481d9cac-31e9-40c7-86f4-31c4a5533cdd	cc4e0b37-7f33-4e50-8524-784c12e3aed6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzRlMGIzNy03ZjMzLTRlNTAtODUyNC03ODRjMTJlM2FlZDYiLCJ1dWlkIjoiMjAwYTZiMTItOGEyMi00OGFlLTlhMGMtNzM2ZGFlZjRiOGZlIiwiaWF0IjoxNzUzNzY5NjQ5LCJleHAiOjE3NTYzNjE2NDl9.LnLOLiCWbro_WLPxVtdDYQS3NQRjUkwR2A9OCGfR1YM	2025-08-28 06:14:09.638	2025-07-29 06:14:09.639
c1add760-1abc-442d-b326-18877b266645	86f25261-13da-4d9c-8727-945357cfabd5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NmYyNTI2MS0xM2RhLTRkOWMtODcyNy05NDUzNTdjZmFiZDUiLCJ1dWlkIjoiMzAxNGFjOGEtYjg4OC00NTM0LThjZjEtNWYxMGQyMTM4NzhjIiwiaWF0IjoxNzU0MDMxOTM0LCJleHAiOjE3NTY2MjM5MzR9.uJZCC7pC1n3MClQ39Ww_kJ8i2OfIJRcRwjZJEugmEkc	2025-08-31 07:05:34.531	2025-08-01 07:05:34.533
875a494e-2854-4c5b-a296-2cc3fbd52292	cc4e0b37-7f33-4e50-8524-784c12e3aed6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzRlMGIzNy03ZjMzLTRlNTAtODUyNC03ODRjMTJlM2FlZDYiLCJ1dWlkIjoiMDBlNTNlOGItZmIzOC00NTQ3LWFiNGItN2RhYzY4YmMxMzMzIiwiaWF0IjoxNzU0MDQxMjkzLCJleHAiOjE3NTY2MzMyOTN9.JKcgKS9NWvLApWG4-TLUI414MO_jRlj1tWbukSEqvPM	2025-08-31 09:41:33.655	2025-08-01 09:41:33.657
a5fb5181-5dd4-4861-ac8f-34a9d2d61cd7	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzdiMzMyMy0wMDhlLTRkOWQtOWZlMy03ZDRiODg2N2Q2M2IiLCJ1dWlkIjoiNmM1ZjQ1NDMtZjY4Ny00ZTU0LTkwMDEtNmQ4YWZjMmE2N2Q1IiwiaWF0IjoxNzU0MzA0MzIxLCJleHAiOjE3NTY4OTYzMjF9.6pOfOZZZk8rvhiARYuTPQJV2Adzoltql8K1ET4Ojx0M	2025-09-03 10:45:21.925	2025-08-04 10:45:21.927
e69d1053-e04f-468c-84ef-94916648a099	cc4e0b37-7f33-4e50-8524-784c12e3aed6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzRlMGIzNy03ZjMzLTRlNTAtODUyNC03ODRjMTJlM2FlZDYiLCJ1dWlkIjoiODYzZTUwNWItOTJiMi00MWFlLTg1ZjMtYzczOWJlNmI0NDBlIiwiaWF0IjoxNzU0MzA0NDc0LCJleHAiOjE3NTY4OTY0NzR9.UrGbA_rCsKZFhmTBe0mjiVqNwmulyRv1V972UWNiBII	2025-09-03 10:47:54.626	2025-08-04 10:47:54.627
e21d4044-9acc-4f45-9014-483ddcb46967	de14e895-4ece-45f0-90fc-e04695d112da	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZTE0ZTg5NS00ZWNlLTQ1ZjAtOTBmYy1lMDQ2OTVkMTEyZGEiLCJ1dWlkIjoiOGM4ZjQzNGMtZGY1NS00NGU5LTkyNzQtYmM2ZDc2OGQ4ZWI2IiwiaWF0IjoxNzU0MzA1MDQyLCJleHAiOjE3NTY4OTcwNDJ9.vbmGcrvGDtpP9pd2Q-L5Oih5wg7c93zKwTsW93QEXgo	2025-09-03 10:57:22.114	2025-08-04 10:57:22.115
0c9e5a89-4a4a-4924-a088-07ff491c9421	cc4e0b37-7f33-4e50-8524-784c12e3aed6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzRlMGIzNy03ZjMzLTRlNTAtODUyNC03ODRjMTJlM2FlZDYiLCJ1dWlkIjoiZTU2OTE2ZjItNGQ5My00MTg5LTk2MjUtYzA5NGUwZDUzNzJhIiwiaWF0IjoxNzU0MzcwMzMxLCJleHAiOjE3NTY5NjIzMzF9.bEnQfVrWIqNS-x8KXYV8dWIBErxFqQntiGsysgprVWg	2025-09-04 05:05:31.51	2025-08-05 05:05:31.511
e62acb27-df6a-4665-88e7-8e35418a1873	86f25261-13da-4d9c-8727-945357cfabd5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NmYyNTI2MS0xM2RhLTRkOWMtODcyNy05NDUzNTdjZmFiZDUiLCJ1dWlkIjoiYzQwMDcwMTItYTJiZi00MWYwLWIwMDktNTNjOWE3YmI3ZTU3IiwiaWF0IjoxNzU0NDgwNDg3LCJleHAiOjE3NTcwNzI0ODd9.w6CT5rrdZFIvDGbdnfKWr3NFAvTfQzj4Ad2fCh6jRxY	2025-09-05 11:41:27.389	2025-08-06 11:41:27.393
e736e0f0-7067-4a5c-a4f3-7d22a7eb0d2a	f02d79a1-4b31-46e9-a6e5-df4b3cc6fc39	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDJkNzlhMS00YjMxLTQ2ZTktYTZlNS1kZjRiM2NjNmZjMzkiLCJ1dWlkIjoiOGY1YTg2MTgtNmJiNi00Yzk3LTkyYTgtZWM5MGMxNWVjZDdhIiwiaWF0IjoxNzU0OTA2ODkxLCJleHAiOjE3NTc0OTg4OTF9.XTqU9D3fPPS7KPvTEem-ENYjFU9zMuBALMFUb4LpgXk	2025-09-10 10:08:11.196	2025-08-11 10:08:11.198
6200cefd-40ec-4861-acd3-6d5a7235de28	bcd76455-81de-4e54-9a73-e1fec954c1ea	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiY2Q3NjQ1NS04MWRlLTRlNTQtOWE3My1lMWZlYzk1NGMxZWEiLCJ1dWlkIjoiNzFjNTkwYTEtMjQzMi00NDE3LWJlNDktM2VmOGIyYTVlMTlhIiwiaWF0IjoxNzU0OTkxOTMyLCJleHAiOjE3NTc1ODM5MzJ9.qjVAZA3EXmJ2zAFEzjaYBhvpzXDulkgRKFdYuv1aGIY	2025-09-11 09:45:32.539	2025-08-12 09:45:32.541
5cd13937-ad20-47db-a265-79c577e0d5aa	cc9fc7b2-f4df-4d38-8859-2d0d4733340d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzlmYzdiMi1mNGRmLTRkMzgtODg1OS0yZDBkNDczMzM0MGQiLCJ1dWlkIjoiMjM5MDg1OWMtMTQwMi00NTVjLWFkZjEtZTlmNmJjM2FmYzBkIiwiaWF0IjoxNzU0OTkyODgzLCJleHAiOjE3NTc1ODQ4ODN9.1BZqZt2yeUvDow5ytqCChM7xcZWyKjk4zkumPaiUxjc	2025-09-11 10:01:23.04	2025-08-12 10:01:23.042
9137c02d-d524-4b2c-8c22-0b959922d94b	893baaa4-fa39-4993-a1dd-b42eac39b568	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTNiYWFhNC1mYTM5LTQ5OTMtYTFkZC1iNDJlYWMzOWI1NjgiLCJ1dWlkIjoiZWIyYmRkMTMtZDU3NC00NWI0LTg5N2YtODAxMjQxN2NiYjkzIiwiaWF0IjoxNzU1MDE3MDc1LCJleHAiOjE3NTc2MDkwNzV9.Ev1Q0-QKz7yDx2BkFSu4a3eEpa4CoOT24Mtacp_bX6k	2025-09-11 16:44:35.5	2025-08-12 16:44:35.503
db3a7a9b-7ca9-4c5e-a1ba-a7c33a4e775f	266673fd-7155-4951-a32a-5bb788382e5a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjY2NzNmZC03MTU1LTQ5NTEtYTMyYS01YmI3ODgzODJlNWEiLCJ1dWlkIjoiMGUyMDJkYWItYTExYy00MWU4LWFjMzktNzI0OThhMjZjN2M4IiwiaWF0IjoxNzU1MDgwNTA5LCJleHAiOjE3NTc2NzI1MDl9.rgYRoZe2Df7nuVWRVKVFxzrTpAanET4YmKg8YkeXOf0	2025-09-12 10:21:49.735	2025-08-13 10:21:49.736
964edbab-a88d-4f82-bccb-6cccd2fb7316	de14e895-4ece-45f0-90fc-e04695d112da	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZTE0ZTg5NS00ZWNlLTQ1ZjAtOTBmYy1lMDQ2OTVkMTEyZGEiLCJ1dWlkIjoiMjViZDczYjAtNTUzMS00MTYxLWJhZDgtMWJhOGZjNjI0NGQwIiwiaWF0IjoxNzU1MDgwNjYxLCJleHAiOjE3NTc2NzI2NjF9.VrDY3xPtRNx3x6PpLf7RhtGlyMqdqJpt2nwWUTXq_08	2025-09-12 10:24:21.55	2025-08-13 10:24:21.551
0be2e2c1-847e-4b36-98ea-2def6e24a33c	239a54f7-1f35-442b-be25-e188456d8faa	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMzlhNTRmNy0xZjM1LTQ0MmItYmUyNS1lMTg4NDU2ZDhmYWEiLCJ1dWlkIjoiMjZiZmE5YmEtNjhmMi00NDc3LWI4YzMtNjZjZDI2NjY3NTllIiwiaWF0IjoxNzU4MzUwNTcxLCJleHAiOjE3NjA5NDI1NzF9.cTM7t7w-wwRhMDYy2d4csNcT50MRPkGRSmLIY3PBuac	2025-10-20 06:42:51.617	2025-09-20 06:42:51.619
9e9569a4-3fc3-4f8a-aced-30b0b06728d6	62c5b3a3-5ae5-4549-a46a-c875b725aff6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmM1YjNhMy01YWU1LTQ1NDktYTQ2YS1jODc1YjcyNWFmZjYiLCJ1dWlkIjoiYWFiNjkyZWYtY2Y2OC00MzliLWI5ZjYtMGIyNzZmMDYyZTM2IiwiaWF0IjoxNzU4MzU5MjU0LCJleHAiOjE3NjA5NTEyNTR9.ij4wcIGzIopNYUKB7t196YfhBp_j8rEJEhpqnTFZ7us	2025-10-20 09:07:34.949	2025-09-20 09:07:34.951
2e0dba3b-0e46-4baf-85d0-63436cc9615f	62c5b3a3-5ae5-4549-a46a-c875b725aff6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmM1YjNhMy01YWU1LTQ1NDktYTQ2YS1jODc1YjcyNWFmZjYiLCJ1dWlkIjoiOTIyYjAzZDAtMWMwYS00YzEyLWIzNDYtYTRkNjY3N2IxNjc3IiwiaWF0IjoxNzU4NDY4MTQ4LCJleHAiOjE3NjEwNjAxNDh9.upZRc4cIBRMWcGOJvJK60gw0-ZEWyKYcERT_JKrbius	2025-10-21 15:22:28.322	2025-09-21 15:22:28.324
b93f3d85-bf23-4197-8c29-942c446efcf7	62c5b3a3-5ae5-4549-a46a-c875b725aff6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmM1YjNhMy01YWU1LTQ1NDktYTQ2YS1jODc1YjcyNWFmZjYiLCJ1dWlkIjoiNGI4MTZlY2EtODNmNC00Yjc0LWI3OTYtOTY5MWQwZWE1MWVjIiwiaWF0IjoxNzU4NjA4ODg2LCJleHAiOjE3NjEyMDA4ODZ9.dXGt1Kd7fcdcVFt6IzDZnixiApumQWuAz_HlYpBnkz8	2025-10-23 06:28:06.376	2025-09-23 06:28:06.378
\.


--
-- Data for Name: Refund; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Refund" (id, amount, status, "uniqueRequestId", "initiatedBy", "refundType", "refundSource", "sentToGateway", "errorCode", "errorMessage", "createdAt", "updatedAt", "paymentId") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Review" (id, rating, review, "userId", "vendorId", "orderItemId", "createdAt", "updatedAt") FROM stdin;
dce49b7d-71d6-4e44-8846-52e2f60eaa9c	5	Vendor has good service	b98b1997-e541-41fb-b143-ecda3d051aae	9e7a1818-1136-4989-8435-7c1c231ae855	\N	2025-06-10 09:14:19.203	2025-06-10 09:14:19.203
ce923f4a-ba4e-4513-bd09-c2b19c94ac04	1	Vendor has good service	f20362b6-0f43-4b85-8d82-03439afbd98c	9e7a1818-1136-4989-8435-7c1c231ae855	\N	2025-06-10 09:17:25.029	2025-06-10 09:17:25.029
b02dd23d-d9d7-43ee-9771-3a40221f292f	2	Vendor has good service	5352645c-7749-4af0-bd27-5b4ac3dfcc79	9e7a1818-1136-4989-8435-7c1c231ae855	\N	2025-06-10 09:17:56.271	2025-06-10 09:17:56.271
0a2cdb65-4119-4930-8dd9-9fed69d9c3d3	2	Vendor has good service	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	9e7a1818-1136-4989-8435-7c1c231ae855	\N	2025-06-10 09:30:06.646	2025-06-10 09:30:06.646
62738232-36d1-46b4-b597-56384038d314	2	This is yummy in taste	a77b3323-008e-4d9d-9fe3-7d4b8867d63b	\N	cab9cd0b-e511-4a32-8367-02e8d6580d2f	2025-07-15 11:28:57.766	2025-07-15 11:28:57.766
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Service" (id, name, description, "serviceOptionId", "vendorId", status, "createdAt", "updatedAt") FROM stdin;
82370960-0b6d-408f-a7a8-a7bb486fdebd	Scooty Puncture Service	It is description	6307b0ee-583c-4b51-a3b4-6b6bfc8be0a2	20c3ef80-f5eb-4fb6-b3c5-3405ab0fc58b	ACTIVE	2025-06-19 17:56:34.018	2025-06-19 17:56:34.018
22c1263c-ba86-4cd6-8cf0-71401bd47632	Yamaha Puncture Service	It is description	6307b0ee-583c-4b51-a3b4-6b6bfc8be0a2	20c3ef80-f5eb-4fb6-b3c5-3405ab0fc58b	ACTIVE	2025-06-20 05:33:08.254	2025-06-20 05:33:08.254
1a1206d6-8511-4687-99f3-30a998b2f499	Splendor Puncture Service	It is description	6307b0ee-583c-4b51-a3b4-6b6bfc8be0a2	8cd1b5a8-963c-40c5-a181-b74b90e1bba3	ACTIVE	2025-08-11 10:13:50.46	2025-08-11 10:13:50.46
\.


--
-- Data for Name: VendorSubService; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."VendorSubService" (id, name, "serviceId", price, "createdAt", "updatedAt") FROM stdin;
4e4cec5c-0144-4601-82b5-1026f72630b0	Front Wheel	82370960-0b6d-408f-a7a8-a7bb486fdebd	100	2025-06-19 17:56:34.018	2025-06-19 17:56:34.018
99e49d9f-c40b-4e83-82c2-4c390c045931	Back Wheel	82370960-0b6d-408f-a7a8-a7bb486fdebd	150	2025-06-19 17:56:34.018	2025-06-19 17:56:34.018
e1376114-73d1-47d5-a9ed-a7b7d4aa2b49	Front Wheel	22c1263c-ba86-4cd6-8cf0-71401bd47632	100	2025-06-20 05:33:08.254	2025-06-20 05:33:08.254
0fd843ce-5bd0-49b5-a42b-9b47cfe614d7	Back Wheel	22c1263c-ba86-4cd6-8cf0-71401bd47632	150	2025-06-20 05:33:08.254	2025-06-20 05:33:08.254
4b9e08ff-240b-49c1-ab71-5164ed04b07b	Front Wheel	1a1206d6-8511-4687-99f3-30a998b2f499	100	2025-08-11 10:13:50.46	2025-08-11 10:13:50.46
0b645e1c-db0c-4b98-8825-2a7cd561bb30	Back Wheel	1a1206d6-8511-4687-99f3-30a998b2f499	150	2025-08-11 10:13:50.46	2025-08-11 10:13:50.46
\.


--
-- Data for Name: ServiceBooking; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ServiceBooking" (id, "bookingId", latitude, longitude, price, "vendorSubServiceId", "createdAt", "updatedAt") FROM stdin;
10be8fbc-c5e4-488d-a5e8-87a9c01eb4c0	95a8639b-2446-4cb5-9a1e-53c6a64fc7fd	0	0	150	99e49d9f-c40b-4e83-82c2-4c390c045931	2025-06-20 05:26:15.067	2025-06-20 05:26:15.067
afe12807-c83c-4798-9455-5d8984ac687e	95a8639b-2446-4cb5-9a1e-53c6a64fc7fd	0	0	100	4e4cec5c-0144-4601-82b5-1026f72630b0	2025-06-20 05:26:15.067	2025-06-20 05:26:15.067
98f26829-3b61-4b48-a9b3-e8473c93de9e	fec7709b-6d68-4e31-a0bb-28b2a29729fd	0	0	150	99e49d9f-c40b-4e83-82c2-4c390c045931	2025-07-29 06:10:12.284	2025-07-29 06:10:12.284
76b60d0d-7986-41cb-bbfc-f71829e94214	fec7709b-6d68-4e31-a0bb-28b2a29729fd	0	0	100	4e4cec5c-0144-4601-82b5-1026f72630b0	2025-07-29 06:10:12.284	2025-07-29 06:10:12.284
c341a460-d8a2-4348-a20b-cdfc6e2cce20	6465368c-e1fc-4517-bc50-5749cf58974a	0	0	150	99e49d9f-c40b-4e83-82c2-4c390c045931	2025-07-29 06:10:18.076	2025-07-29 06:10:18.076
7eb736f4-0014-4184-ad1f-ea48726e1a39	6465368c-e1fc-4517-bc50-5749cf58974a	0	0	100	4e4cec5c-0144-4601-82b5-1026f72630b0	2025-07-29 06:10:18.076	2025-07-29 06:10:18.076
\.


--
-- Data for Name: ServiceImage; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ServiceImage" (id, "serviceId", "relativeUrl", "absoluteUrl", "createdAt", "updatedAt") FROM stdin;
8e3277e5-cc79-4767-b0d2-358051d5ec8b	82370960-0b6d-408f-a7a8-a7bb486fdebd	./uploads/subService/1750355794017-943063997-20250426_185541.jpg	http://localhost:3000/client/subService/1750355794017-943063997-20250426_185541.jpg	2025-06-19 17:56:34.018	2025-06-19 17:56:34.018
63d8993a-d424-4169-96a1-06b7cc3c0b8c	22c1263c-ba86-4cd6-8cf0-71401bd47632	./uploads/service/1750397588252-671890068-20250426_185541.jpg	http://localhost:3000/client/service/1750397588252-671890068-20250426_185541.jpg	2025-06-20 05:33:08.254	2025-06-20 05:33:08.254
377f5b36-ed43-45c7-8bc0-c56ab0500616	1a1206d6-8511-4687-99f3-30a998b2f499	./uploads/service/1754907230459-558514577-machine -1.jpg	http://localhost:3000/client/service/1754907230459-558514577-machine -1.jpg	2025-08-11 10:13:50.46	2025-08-11 10:13:50.46
a72e91a5-700d-4680-abfa-51df286b9d38	1a1206d6-8511-4687-99f3-30a998b2f499	./uploads/service/1754907230459-283954912-imag1.jpg	http://localhost:3000/client/service/1754907230459-283954912-imag1.jpg	2025-08-11 10:13:50.46	2025-08-11 10:13:50.46
\.


--
-- Data for Name: ServiceVendorKeyword; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ServiceVendorKeyword" (id, "keywordId", "vendorId", "createdAt", "updatedAt") FROM stdin;
c4b8bbba-1f04-4258-a398-6c2f6f600d97	17d54205-59d8-4f5e-8ab5-4a1492237b6c	8cd1b5a8-963c-40c5-a181-b74b90e1bba3	2025-06-17 09:34:31.089	2025-06-17 09:34:31.089
ace9e97d-b93f-41f3-8dc4-16337bbb5a04	cd3a4310-82f3-44f5-b64d-83920ee8c0c8	20c3ef80-f5eb-4fb6-b3c5-3405ab0fc58b	2025-06-20 05:11:18.045	2025-06-20 05:11:18.045
\.


--
-- Data for Name: ShopWorkingHour; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."ShopWorkingHour" (id, "shopId", area, "dayOfWeek", "openTime", "closeTime", "isClosed") FROM stdin;
3fc73353-1f35-4f16-9bf3-7f0b26ef5f30	cc6e49aa-a5d7-4e5f-8398-c54ce7fcc90a	Hello	MONDAY	1960-01-01 09:00:00	1960-01-01 18:00:00	f
c1f299b2-7e25-46bb-91e4-669f74bec2f5	cc6e49aa-a5d7-4e5f-8398-c54ce7fcc90a	\N	TUESDAY	1960-01-01 10:00:00	1960-01-01 18:00:00	f
3c46d702-566c-4b0a-933c-8d1cc8e40c3e	cc6e49aa-a5d7-4e5f-8398-c54ce7fcc90a	\N	WEDNESDAY	1960-01-01 09:00:00	1960-01-01 18:00:00	f
7b012b17-daa8-4e8e-8f18-22452df6fd90	cc6e49aa-a5d7-4e5f-8398-c54ce7fcc90a	\N	THURSDAY	1960-01-01 09:00:00	1960-01-01 18:00:00	f
3250c48b-3dcf-4a13-9775-c66479586f79	cc6e49aa-a5d7-4e5f-8398-c54ce7fcc90a	\N	FRIDAY	1960-01-01 09:00:00	1960-01-01 18:00:00	f
f2e18e04-28c8-464d-9cff-888f636979ce	cc6e49aa-a5d7-4e5f-8398-c54ce7fcc90a	\N	SATURDAY	1960-01-01 10:00:00	1960-01-01 16:00:00	f
0a3cec86-0507-4b51-8329-5a73da4126da	cc6e49aa-a5d7-4e5f-8398-c54ce7fcc90a	\N	SUNDAY	\N	\N	t
\.


--
-- Data for Name: Staff; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."Staff" (id, "vendorId", "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: SubscriptionPlan; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."SubscriptionPlan" (id, name, price, "billingPeriod", "discountPrice", "vendorTypeId", features, "gradientStart", "gradientEnd", status, "createdAt", "updatedAt") FROM stdin;
32db890c-9513-4c88-a809-a5fa602b165c	Standard Plan	100	MONTHLY	\N	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{"dineOptions": ["Takeaway", "Dinein"], "paymentModes": ["CASH", "JUSPAY"], "stockEditable": true, "qtyUpdateLimit": 10, "openCloseStatus": true, "locationChangeLimit": 5, "productStatusChangeLimit": 10}	\N	\N	ACTIVE	2025-06-05 05:54:11.542	2025-06-05 05:54:11.542
a3001133-b5e7-4a5a-acba-6ffe86ce44b8	Golden Plan	200	MONTHLY	\N	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{"banner": true, "dineOptions": ["Takeaway", "Dinein"], "paymentModes": ["CASH", "JUSPAY", "COINS"], "stockEditable": true, "qtyUpdateLimit": "unlimited", "customerSupport": true, "openCloseStatus": true, "coinsLimitations": "unlimited", "staffAccountLimit": "unlimited", "locationChangeLimit": "unlimited", "socialMeduiaPromotion": true, "productStatusChangeLimit": "unlimited"}	\N	\N	INACTIVE	2025-06-05 05:55:31.189	2025-06-05 05:55:31.189
0715ef40-b2ef-4319-9962-184da07d719b	Standard Plan	100	MONTHLY	\N	726f6995-1873-49dd-b500-ec6ec3151e77	{"status": "ACTIVE", "tracking": true, "paymentModes": ["CASH"], "openCloseStatus": true, "staffAccountLimit": 10, "locationChangeLimit": 10}	\N	\N	INACTIVE	2025-06-05 05:59:18.312	2025-06-05 05:59:18.312
23a7ade7-0554-4ba4-a1fb-d6579b001d93	Standard Plan	50	WEEKLY	\N	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{"dineOptions": ["Takeaway", "Dinein"], "paymentModes": ["CASH", "JUSPAY"], "stockEditable": true, "qtyUpdateLimit": 60, "customerSupport": true, "openCloseStatus": true, "staffAccountLimit": 2, "locationChangeLimit": 5, "productStatusChangeLimit": 20}	\N	\N	ACTIVE	2025-06-12 05:57:53.393	2025-06-12 05:57:53.393
5b2b75e7-46bf-414b-99d7-9fad38656378	Basic Plan	100	MONTHLY	50	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{"banner": true, "tracking": true, "bannerCount": 5, "dineOptions": ["Takeaway", "Dinein"], "paymentModes": [], "stockEditable": true, "qtyUpdateLimit": 100, "customerSupport": true, "openCloseStatus": true, "coinsLimitations": 0, "staffAccountLimit": 4, "locationChangeLimit": 1, "socialMeduiaPromotion": true, "productStatusChangeLimit": 100}	#3B82F6	#1E40AF	ACTIVE	2025-09-23 09:18:39.227	2025-09-23 09:18:39.227
16555	Standard Plan4	100	MONTHLY	\N	726f6995-1873-49dd-b500-ec6ec3151e77	{"status": "ACTIVE", "tracking": true, "paymentModes": ["CASH"], "openCloseStatus": true, "staffAccountLimit": 10, "locationChangeLimit": 10}	\N	\N	INACTIVE	2025-06-05 05:59:18.312	2025-06-05 05:59:18.312
456	Standard Plan3	50	WEEKLY	\N	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{"dineOptions": ["Takeaway", "Dinein"], "paymentModes": ["CASH", "JUSPAY"], "stockEditable": true, "qtyUpdateLimit": 60, "customerSupport": true, "openCloseStatus": true, "staffAccountLimit": 2, "locationChangeLimit": 5, "productStatusChangeLimit": 20}	\N	\N	ACTIVE	2025-06-12 05:57:53.393	2025-06-12 05:57:53.393
134	Standard Plan2	100	MONTHLY	\N	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{"dineOptions": ["Takeaway", "Dinein"], "paymentModes": ["CASH", "JUSPAY"], "stockEditable": true, "qtyUpdateLimit": 10, "openCloseStatus": true, "locationChangeLimit": 5, "productStatusChangeLimit": 10}	\N	\N	ACTIVE	2025-06-05 05:54:11.542	2025-06-05 05:54:11.542
111	Basic Plan1	100	MONTHLY	50	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{"banner": true, "tracking": true, "bannerCount": 5, "dineOptions": ["Takeaway", "Dinein"], "paymentModes": [], "stockEditable": true, "qtyUpdateLimit": 100, "customerSupport": true, "openCloseStatus": true, "coinsLimitations": 0, "staffAccountLimit": 4, "locationChangeLimit": 1, "socialMeduiaPromotion": true, "productStatusChangeLimit": 100}	#3B82F6	#1E40AF	ACTIVE	2025-09-23 09:18:39.227	2025-09-23 09:18:39.227
123	Golden Plan1	200	MONTHLY	\N	3ee8d4c4-0804-41ea-9487-8bf4b92a15b2	{"banner": true, "dineOptions": ["Takeaway", "Dinein"], "paymentModes": ["CASH", "JUSPAY", "COINS"], "stockEditable": true, "qtyUpdateLimit": "unlimited", "customerSupport": true, "openCloseStatus": true, "coinsLimitations": "unlimited", "staffAccountLimit": "unlimited", "locationChangeLimit": "unlimited", "socialMeduiaPromotion": true, "productStatusChangeLimit": "unlimited"}	\N	\N	INACTIVE	2025-06-05 05:55:31.189	2025-06-05 05:55:31.189
\.


--
-- Data for Name: TempRegister; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."TempRegister" (id, "cacheKey", role, "sessionId", "expiresAt", "fcmToken", status, "licenseRelPath", "licenseAbsPath", "profileRelPath", "profileAbsPath", "shopRelPath", "shopAbsPath", "createdAt", "updatedAt") FROM stdin;
4b4ff057-1dc2-4a92-b446-a02475594feb	reg:temp:942b92f7-037d-48be-baca-0603041ff88d	CUSTOMER	otp_eyJpbnRlZ3JhdGlvbklkIjoiYnllU3lrNkNJY0pCRFB6YUgxRmN6U3RLWVloaDJxbVpmelp6dFE1d3U5VmJ5NmdSVnlEU3N5aEcxUEJVUXJzYk5JNW9FNG1qcUtsRkhLRmltc3A3RFR4dGpjQkx1clo3djAiLCJjbGllbnRUeXBlIjoiTU9CSUxFIiwidGltZXN0YW1wIjoxNzU0OTg3OTEzODQ3LCJjb3VudGVyIjo3OTMzMzk2MDAyMTc3OTYwLCJlbnRyb3B5IjoiMWRlNzk3OGQ1ZWU4ZGMwYzQ1ZTMyYjQ0ZDE5NTI3NGIyMTE1NzI4YzBlYjJiYWU3ZTZkNzU2NjBmMzZhOGY2ZCIsIm1ldGFkYXRhIjp7Im9yaWdpbmFsU2Vzc2lvbklkIjoib3RwXzE3NTQ5ODc5MTNfSVk4VjNhWW5lSWN2VzhZeVVqN1B4WWdqMHJlWldDb1oiLCJwaG9uZU51bWJlciI6Iis5MTYzNjk5MTM1NjQiLCJyZXF1ZXN0VGltZSI6IjIwMjUtMDgtMTJUMDg6Mzg6MzMuODQ3WiJ9fQ.e60efc3300df7de5	2025-08-12 08:48:33.836	\N	PENDING	\N	\N	./uploads/profiles/1754987913410-658962098-machine -1.jpg	http://localhost:3000/client/profiles/1754987913410-658962098-machine -1.jpg	\N	\N	2025-08-12 08:38:33.755	2025-08-12 08:38:33.755
ff2ed2cc-6b50-445b-ae1c-e0d00ca5dc82	reg:temp:4feb8515-4742-4c03-984d-764521f445ab	CUSTOMER	otp_eyJpbnRlZ3JhdGlvbklkIjoiYnllU3lrNkNJY0pCRFB6YUgxRmN6U3RLWVloaDJxbVpmelp6dFE1d3U5VmJ5NmdSVnlEU3N5aEcxUEJVUXJzYk5JNW9FNG1qcUtsRkhLRmltc3A3RFR4dGpjQkx1clo3djAiLCJjbGllbnRUeXBlIjoiTU9CSUxFIiwidGltZXN0YW1wIjoxNzU0OTg4NDc3MTEzLCJjb3VudGVyIjo3OTMzOTU5MjY4NDE1NDE2LCJlbnRyb3B5IjoiY2Q4ZmNhNDhiZDg1NjZjNDE2NDVlZDY5ZmRmNTRmMGNlZjIyY2NiNzMwODg3MGM0YjcwNzE5MzM4NTE0OWUwNyIsIm1ldGFkYXRhIjp7Im9yaWdpbmFsU2Vzc2lvbklkIjoib3RwXzE3NTQ5ODg0NzZfUUVTNmRPVWZUNEtERXlWR2gwT2hkZTlidG5NYTRSbVUiLCJwaG9uZU51bWJlciI6Iis5MTYzNjk5MTM1NjQiLCJyZXF1ZXN0VGltZSI6IjIwMjUtMDgtMTJUMDg6NDc6NTcuMTEzWiJ9fQ.5c438eb33c8088d0	2025-08-12 08:57:57.089	\N	PENDING	\N	\N	./uploads/profiles/1754988476662-581608935-machine -1.jpg	http://localhost:3000/client/profiles/1754988476662-581608935-machine -1.jpg	\N	\N	2025-08-12 08:47:57.033	2025-08-12 08:47:57.033
1a68fd5c-3cda-4c2a-9ab2-a97127a4fdf8	reg:temp:583104df-3c1f-476f-a095-5cac473d1892	CUSTOMER	otp_eyJpbnRlZ3JhdGlvbklkIjoiYnllU3lrNkNJY0pCRFB6YUgxRmN6U3RLWVloaDJxbVpmelp6dFE1d3U5VmJ5NmdSVnlEU3N5aEcxUEJVUXJzYk5JNW9FNG1qcUtsRkhLRmltc3A3RFR4dGpjQkx1clo3djAiLCJjbGllbnRUeXBlIjoiTU9CSUxFIiwidGltZXN0YW1wIjoxNzU0OTg4NTY5NzQyLCJjb3VudGVyIjo3OTM0MDUxODk3MTg5MDYwLCJlbnRyb3B5IjoiYWY5NTUwYTc4YWQxMzg2NzJlMjgxMmUwY2U4MjkxMDVjYTdiN2Q4MjI2NGVkYzNkN2YwOTc3NWExOWQwMGNiNSIsIm1ldGFkYXRhIjp7Im9yaWdpbmFsU2Vzc2lvbklkIjoib3RwXzE3NTQ5ODg1NjlfdFRHNmMxZW5xTENOVGNXMXVFNzJTc1gwWm1URmVTSWoiLCJwaG9uZU51bWJlciI6Iis5MTk3OTc5Nzk3OTciLCJyZXF1ZXN0VGltZSI6IjIwMjUtMDgtMTJUMDg6NDk6MjkuNzQyWiJ9fQ.cb1dc817ef36eb6e	2025-08-12 08:59:29.731	\N	PENDING	\N	\N	./uploads/profiles/1754988569377-661999046-machine -1.jpg	http://localhost:3000/client/profiles/1754988569377-661999046-machine -1.jpg	\N	\N	2025-08-12 08:49:29.668	2025-08-12 08:49:29.668
a6aefb79-078a-422d-a99b-2fb97428a62e	reg:temp:347c9596-bf24-4702-9c54-334754a63a91	CUSTOMER	otp_eyJpbnRlZ3JhdGlvbklkIjoiYnllU3lrNkNJY0pCRFB6YUgxRmN6U3RLWVloaDJxbVpmelp6dFE1d3U5VmJ5NmdSVnlEU3N5aEcxUEJVUXJzYk5JNW9FNG1qcUtsRkhLRmltc3A3RFR4dGpjQkx1clo3djAiLCJjbGllbnRUeXBlIjoiTU9CSUxFIiwidGltZXN0YW1wIjoxNzU0OTg5MDgxMTMwLCJjb3VudGVyIjo3OTM0NTYzMjg1MjUwMzg0LCJlbnRyb3B5IjoiZWFkMGFiYTkxODllZGNiN2U5ZjI3ODc4OGY4MDA2ZTAxYjMxMjgyMzZjZDZiNDUwODY4NTNkMzY1Y2EyYTdkNSIsIm1ldGFkYXRhIjp7Im9yaWdpbmFsU2Vzc2lvbklkIjoib3RwXzE3NTQ5ODkwODBfNFV3SWkwRllFYm53RUJZa09uU0JFMlZ5ZXRhb0VCUVoiLCJwaG9uZU51bWJlciI6Iis5MTk3OTc5Nzk3OTciLCJyZXF1ZXN0VGltZSI6IjIwMjUtMDgtMTJUMDg6NTg6MDEuMTMwWiJ9fQ.5b85694fc8a123fb	2025-08-12 09:08:01.102	\N	PENDING	\N	\N	./uploads/profiles/1754989080571-323597651-machine -1.jpg	http://localhost:3000/client/profiles/1754989080571-323597651-machine -1.jpg	\N	\N	2025-08-12 08:58:01.07	2025-08-12 08:58:01.07
\.


--
-- Data for Name: TermsAndCondition; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."TermsAndCondition" (id, image, "userType", "createdAt", "updatedAt") FROM stdin;
3e347375-a2fc-447d-9861-7a2c2b1b17fe	/Users/rithi/Desktop/Arunkumar/project/erowayz_uploads/termsAndCondition/1758536492586-2188359-sample2.html	CUSTOMER	2025-09-22 10:21:32.587	2025-09-22 10:21:32.587
\.


--
-- Data for Name: VendorReferral; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."VendorReferral" (id, "referrerId", "refereeId", "createdAt") FROM stdin;
\.


--
-- Data for Name: VendorSubscription; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."VendorSubscription" (id, "vendorId", "paymentId", "planId", "planName", "planFeatures", "planBillingPeriod", "planPrice", "planDiscountPrice", "startDate", "endDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: VideoLink; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public."VideoLink" (id, heading, link, status, "createdAt", "updatedAt") FROM stdin;
31506d4b-177e-45fe-9297-8a62bd73821d	Hi,This is heading	https://www.geeksforgeeks.org/javascript/what-is-an-event-loop-in-javascript/	ACTIVE	2025-09-22 10:46:39.203	2025-09-22 10:46:39.203
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3f157d33-cff1-4fe3-aeec-9be698f001a2	616449d2cb376e1b04fcb92bd1d959ca46ee248668746413e167f9244492e453	2025-09-24 23:28:06.401689+05:30	20250924175804_init	\N	\N	2025-09-24 23:28:04.246348+05:30	1
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: arunkumar
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

