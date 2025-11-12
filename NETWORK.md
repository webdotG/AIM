# Сетевая архитектура конспект по созданию домашней сети 

> описывает защиту и организацию серверов для тестового окружения  
> **О:** Три изолированные сети + VPN контроль + Wireshark анализ трафика  

**Статус:** В разработке Конспект  
**Дата:** Ноябрь 2025  

---

## Общая схема

```
Internet (Static White IP: 31.134.174.22)
         │
         │ (2-3 порта открыты для внешнего доступа)
         │
         ↓
┌─────────────────────────────────────────────────────────────────┐
│  MikroTik Hub (гигабитный, 2GHz + 5GHz)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Функции:                                                  │  │
│  │ • Routing + Firewall + NAT                                │  │
│  │ • Proxy server                                            │  │
│  │ • Port forwarding (80, 443 → Main Server)                 │  │
│  │ • VLAN изоляция (3 независимые сети)                      │  │
│  │ • DPI (Deep Packet Inspection) для Wireshark              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────┬──────────────────────┬────────────────────┐  │
│  │  Гостевая    │  Домашняя VPN сеть   │  IoT сеть (Zigbee) │  │
│  │  сеть        │  (контролируемая)    │                    │  │
│  └──────────────┴──────────────────────┴────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                        │
         │                    │                        │
         ↓                    ↓                        ↓

┌──────────────┐   ┌───────────────────────┐   ┌─────────────────┐
│ Гостевая     │   │ Домашняя VPN          │   │ IoT устройства  │
│ WiFi 5GHz    │   │ WiFi 2GHz + LAN       │   │ (Zigbee 3.0)    │
│              │   │                       │   │ WiFi 2GHz       │
│ • Телефоны   │   │ ┌──────────────────┐  │   │                 │
│   гостей     │   │ │ OpenConnect VPN  │  │   │ • Лампочки      │
│ • Ноутбуки   │   │ │ (маршрутизация)  │  │   │ • Датчики       │
│              │   │ └────────┬─────────┘  │   │ • Розетки       │
│ Доступ:      │   │          │            │   │                 │
│ • Только     │   │     ┌────┴─────┐      │   │ Управление:     │
│   интернет   │   │     │ Germany  │      │   │ • Raspberry Pi  │
│ • Нет LAN    │   │     │ Server   │      │   │   Zigbee Hub    │
│              │   │     │ (VPN)    │      │   │   (проводник)   │
└──────────────┘   │     └──────────┘      │   └────────┬────────┘
                   │          ↓            │            │
                   │   ┌──────────────┐    │   ┌────────┴────────┐
                   │   │ Wireshark    │    │   │ Raspberry Pi    │
                   │   │ Monitoring   │    │   │ IP: 192.168.3.x │
                   │   └──────────────┘    │   │ LAN подключение │
                   │          │            │   └─────────────────┘
                   │   ┌──────┴──────┐     │
                   │   │ Main Server │     │
                   │   │ (Docker)    │     │
                   │   │ LAN кабель  │     │
                   └───┴─────────────┴─────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│  Main Server (512GB, Linux)                              │
│  IP: 192.168.2.10 (статический DHCP)                     │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Wireshark Packet Capture                          │  │
│  │  • Входящий трафик (из интернета)                  │  │
│  │  • Исходящий трафик (к интернету)                  │  │
│  │  • Межсетевой трафик (VPN ↔ IoT)                   │  │
│  │  • Поиск уязвимостей и аномалий                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Docker Compose Network                            │  │
│  │                                                    │  │
│  │  ┌────────────┐                                    │  │
│  │  │   NGINX    │ :443 (SSL)                        │  │
│  │  │ Reverse    │ :80 (redirect → 443)              │  │
│  │  │  Proxy     │                                    │  │
│  │  └─────┬──────┘                                    │  │
│  │        │                                           │  │
│  │        ├─→ /      → Web App (статика)             │  │
│  │        ├─→ /tg    → Telegram App (статика)        │  │
│  │        └─→ /api   → Backend API (Express)         │  │
│  │                                                    │  │
│  │  ┌──────────┐  ┌──────────────┐                   │  │
│  │  │ Web App  │  │ Telegram App │                   │  │
│  │  │  :3000   │  │    :3001     │                   │  │
│  │  └────┬─────┘  └──────┬───────┘                   │  │
│  │       │                │                           │  │
│  │       └────────┬───────┘                           │  │
│  │                ↓                                   │  │
│  │         ┌─────────────┐                            │  │
│  │         │  Backend    │                            │  │
│  │         │   Express   │                            │  │
│  │         │    :4000    │                            │  │
│  │         └──────┬──────┘                            │  │
│  │                │                                   │  │
│  │                ↓                                   │  │
│  │         ┌─────────────┐                            │  │
│  │         │ PostgreSQL  │                            │  │
│  │         │   :5432     │                            │  │
│  │         └─────────────┘                            │  │
│  │                                                    │  │
│  │  Внутренняя bridge сеть (isolated)                │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

         (В будущем, в домашней VPN сети)
                    ↓
┌──────────────────────────────────────────────────────────┐
│  AI Server (Python, GPU)                                 │
│  IP: 192.168.2.20 (статический)                          │
│  Доступ: ТОЛЬКО из домашней VPN сети                     │
│                                                           │
│  • Психоаналитик (Jungian analysis)                      │
│  • Image Generation (Stable Diffusion?)                  │
│  • Video Generation                                      │
│  HTTP API :8000                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Три изолированные сети

### VLAN 10: Гостевая сеть (5GHz WiFi)

**Назначение:** Доступ к интернету для гостей без риска для внутренней сети

**Характеристики:**
- **Частота:** 5GHz WiFi (скорость, меньше помех)
- **IP диапазон:** `192.168.10.0/24`
- **Gateway:** `192.168.10.1` (MikroTik)
- **DHCP:** Автоматический (срок аренды 2 часа)

**Доступ:**
- Интернет (через Static IP)
- LAN устройства (полная изоляция)
- Домашняя VPN сеть
- IoT сеть

**Firewall правила:**
```routeros
# Разрешить только ESTABLISHED/RELATED
/ip firewall filter add chain=forward src-address=192.168.10.0/24 connection-state=established,related action=accept

# Запретить доступ к локальным сетям
/ip firewall filter add chain=forward src-address=192.168.10.0/24 dst-address=192.168.0.0/16 action=drop

# Разрешить выход в интернет
/ip firewall filter add chain=forward src-address=192.168.10.0/24 action=accept
```

**Зачем:** Гости получают интернет, но не могут достучаться до серверов, камер, NAS и т.д.

---

### VLAN 20: Домашняя VPN сеть (2GHz WiFi + LAN)

**Назначение:** Контролируемая сеть для устройств с возможностью VPN туннелирования

**Характеристики:**
- **Частота:** 2GHz WiFi (больше дальность, проходимость через стены)
- **LAN кабель:** Гигабитный Ethernet
- **IP диапазон:** `192.168.2.0/24`
- **Gateway:** `192.168.2.1` (MikroTik)
- **VPN:** OpenConnect (клиентская конфигурация)

**Устройства:**
- Твой телефон (WiFi 2GHz)
- Main Server (LAN кабель)
- AI Server (LAN кабель)
- Ноутбук/ПК (LAN кабель)

**OpenConnect VPN маршрутизация:**
```
Домашнее устройство → MikroTik → OpenConnect VPN → Germany Server → Internet
                                     ↓
                              (опционально)
                    Можно включить/выключить per-device
```

**Настройка на MikroTik:**
```routeros
# OpenConnect VPN client
/interface ovpn-client add name=vpn-germany \
    connect-to=germany-server.vpn.com \
    user=your_username \
    password=your_password \
    certificate=your_cert.crt

# Маршрутизация трафика через VPN (опционально)
/ip route add dst-address=0.0.0.0/0 gateway=vpn-germany routing-mark=via-vpn

# Policy-based routing (выбор устройств)
/ip firewall mangle add chain=prerouting src-address=192.168.2.0/24 action=mark-routing new-routing-mark=via-vpn
```

**Wireshark мониторинг:**
```bash
# На Main Server (постоянный захват)
tcpdump -i eth0 -w /captures/$(date +%Y%m%d_%H%M%S).pcap

# Фильтр для анализа
wireshark -r capture.pcap -Y "ip.src == 192.168.2.0/24 || ip.dst == 192.168.2.0/24"
```

**Проверка на уязвимости:**
- Анализ DNS запросов (утечки?)
- Нешифрованный трафик (HTTP без TLS?)
- Подозрительные порты (C&C серверы?)
- Аномальный объём данных (эксфильтрация?)

**Доступ:**
- Интернет (напрямую или через VPN)
- Main Server
- AI Server (будущий)
- Zigbee Hub (управление IoT)
- Гостевая сеть (односторонняя изоляция)

---

### VLAN 30: IoT сеть (Zigbee 3.0)

**Назначение:** Изолированная сеть для умных устройств (лампочки, датчики, розетки)

**Характеристики:**
- **Частота:** 2GHz WiFi для некоторых устройств
- **Протокол:** Zigbee 3.0 mesh сеть, низкое энергопотребление
- **IP диапазон:** `192.168.3.0/24`
- **Gateway:** `192.168.3.1` MikroTik
- **Coordinator:** Raspberry Pi подключен по LAN

**Устройства:**
- Raspberry Pi 4/5 (Zigbee USB dongle)
- Умные лампочки розетки
- Датчики
- Zigbee end devices

**Raspberry Pi Zigbee Hub:**
```yaml
# Zigbee2MQTT
services:
  zigbee2mqtt:
    image: koenkk/zigbee2mqtt
    volumes:
      - ./data:/app/data
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0  # Zigbee dongle
    environment:
      - TZ=Europe/Warsaw
    ports:
      - 8080:8080  # Web UI (доступен из домашней сети)
```

**IP адрес Raspberry Pi:** `192.168.3.10` (статический DHCP)

**Доступ:**
- Интернет (для обновлений прошивок)
- Управление из домашней VPN сети (192.168.2.x → 192.168.3.10)
- Гостевая сеть (полная изоляция)
- Прямой доступ IoT устройств к интернету (только через Raspberry Pi)

**Firewall правила:**
```routeros
# IoT устройства не могут инициировать соединения наружу
/ip firewall filter add chain=forward src-address=192.168.3.0/24 dst-address=!192.168.3.0/24 action=drop

# Raspberry Pi может выходить в интернет
/ip firewall filter add chain=forward src-address=192.168.3.10 action=accept

# Домашняя сеть может управлять IoT
/ip firewall filter add chain=forward src-address=192.168.2.0/24 dst-address=192.168.3.0/24 action=accept
```

## Контроль трафика через OpenConnect VPN

### Архитектура VPN ?????

```
Устройство → ? MikroTik → [Выбор маршрута] ?→ Internet
                            ↓
                     ┌──────┴──────┐
                     │             │
              Прямой путь    OpenConnect VPN
                 ↓                 ↓
            Static IP        Germany Server
          31.134.174.22                    
```

### Зачем VPN:

1. **Анонимность:** IP адрес Germany Server вместо твоего
2. **Контроль:** Весь трафик проходит через точку, где можешь анализировать
3. **Безопасность:** Дополнительное шифрование (даже если ISP логирует)
4. **Гибкость:** Можно включать/выключать per-device или per-application

### Wireshark анализ на входе в VPN:

```bash
# Захват трафика ДО шифрования VPN
tcpdump -i eth0 -w pre-vpn.pcap

# Захват трафика ПОСЛЕ VPN (в туннеле)
tcpdump -i tun0 -w post-vpn.pcap

# Сравнение (проверка на утечки)
wireshark pre-vpn.pcap post-vpn.pcap
```

**Что искать:**
- DNS leaks (запросы идут мимо VPN?)
- WebRTC leaks (реальный IP виден?)
- IPv6 leaks (если VPN только IPv4)

### Policy-based routing (выборочное использование VPN):

```routeros
# Только определённые устройства через VPN
/ip firewall mangle add chain=prerouting src-address=192.168.2.15 action=mark-routing new-routing-mark=via-vpn  # Твой телефон

# Main Server напрямую (для низкой латентности к Static IP)
/ip firewall mangle add chain=prerouting src-address=192.168.2.10 action=mark-routing new-routing-mark=direct

# Routing tables
/ip route add dst-address=0.0.0.0/0 gateway=vpn-germany routing-mark=via-vpn
/ip route add dst-address=0.0.0.0/0 gateway=192.168.2.1 routing-mark=direct
```

---

## Wireshark: Постоянный мониторинг на уязвимости

### Точки захвата трафика:

1. **WAN интерфейс (из интернета):**
   ```bash
   tcpdump -i eth0 'not port 22' -w /captures/wan_$(date +%Y%m%d).pcap
   ```
   **Что искать:**
   - Port scanning попытки
   - SYN flood атаки
   - Подозрительные источники (Shodan, бот-сети)

2. **LAN интерфейс (к Main Server):**
   ```bash
   tcpdump -i eth1 -w /captures/lan_$(date +%Y%m%d).pcap
   ```
   **Что искать:**
   - ARP spoofing
   - MITM атаки внутри сети
   - Нелегитимные DHCP серверы

3. **VPN туннель (до/после шифрования):**
   ```bash
   tcpdump -i tun0 -w /captures/vpn_$(date +%Y%m%d).pcap
   ```
   **Что искать:**
   - Утечки plaintext данных
   - DNS leaks
   - Корреляция трафика (timing attacks)

### Автоматизация анализа:

```python
# Скрипт для автоматического поиска аномалий
import pyshark

capture = pyshark.FileCapture('capture.pcap')

for packet in capture:
    # Поиск нешифрованных паролей
    if 'HTTP' in packet and 'password' in str(packet):
        print(f"[!] Plaintext password: {packet}")
    
    # Поиск SQL injection попыток
    if 'HTTP' in packet and ('UNION' in str(packet) or 'SELECT' in str(packet)):
        print(f"[!] Possible SQL injection: {packet}")
    
    # Поиск подозрительных портов
    if hasattr(packet, 'tcp') and int(packet.tcp.dstport) in [4444, 31337, 12345]:
        print(f"[!] Suspicious port: {packet}")
```

### Регулярные проверки:

**Еженедельно:**
- Проверка IoT устройств на аномальный трафик
- Анализ DNS запросов (к каким доменам обращаются устройства?)
- Проверка на backdoor соединения (постоянные коннекты к неизвестным IP)

**Ежемесячно:**
- Полный анализ трафика за период (базовые паттерны)
- Сравнение с baseline (новые устройства/сервисы?)
- Обновление firewall правил на основе находок

---

## Сетевые адреса 

### Внешние
- **Static White IP:** `31.134.174.22`
- **Открытые порты:** 80 HTTP, 443 HTTPS, SSH на 6969
- **DNS:** `MY?domain.com?` → `31.134.174.22`

### VLAN 10: Гостевая сеть
- **Subnet:** `192.168.10.0/24`
- **Gateway:** `192.168.10.1` MikroTik
- **DHCP pool:** `192.168.10.100-192.168.10.200`

### VLAN 20: Домашняя VPN сеть
- **Subnet:** `192.168.2.0/24`
- **Gateway:** `192.168.2.1` MikroTik
- **Main Server:** `192.168.2.10` статический
- **AI Server:** `192.168.2.20` статический
- **Мой телефон:** `192.168.2.15` статический или резервированный DHCP

### VLAN 30: IoT сеть
- **Subnet:** `192.168.3.0/24`
- **Gateway:** `192.168.3.1` MikroTik
- **Raspberry Pi Zigbee Hub:** `192.168.3.10` статический
- **DHCP pool:** `192.168.3.50-192.168.3.100` для WiFi IoT устройств

### Docker Internal
- **NGINX:** `nginx:443` service name
- **Backend API:** `api:4000`
- **Web App:** `web-app:3000`
- **Tg App:** `tg-app:3001`
- **PostgreSQL:** `postgres:5432`

### VPN
- **Germany Server:** `vpn-server.germany.com`
- **OpenConnect туннель:** `tun0` virtual interface на MikroTik

---

## MikroTik

### Базовая настройка

```routeros
# пароли
/user set admin password=АДМИНАДМИН

# NTP для точного времени для логов
/system ntp client set enabled=yes primary-ntp=pool.ntp.org

# DNS серверы
/ip dns set servers=1.1.1.1,8.8.8.8 allow-remote-requests=yes
```

### VLAN конфигурация

```routeros
# Создание VLAN интерфейсов
/interface vlan add name=vlan10-guest vlan-id=10 interface=bridge
/interface vlan add name=vlan20-home vlan-id=20 interface=bridge
/interface vlan add name=vlan30-iot vlan-id=30 interface=bridge

# IP адреса
/ip address add address=192.168.10.1/24 interface=vlan10-guest
/ip address add address=192.168.2.1/24 interface=vlan20-home
/ip address add address=192.168.3.1/24 interface=vlan30-iot
```

### DHCP серверы

```routeros
# Гостевая сеть
/ip pool add name=pool-guest ranges=192.168.10.100-192.168.10.200
/ip dhcp-server add name=dhcp-guest interface=vlan10-guest address-pool=pool-guest lease-time=2h

...
```

..........
.....
...............
...
........