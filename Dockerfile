# This Dockerfile sets up a PHP environment with Apache for the Pixeldrain Bypass application
# Use PHP 8.2 with Apache
FROM php:8.2-apache

# Copy all files to the container
COPY . /var/www/html/

# Aktifkan mod_rewrite jika perlu
# Activate mod_rewrite if needed
RUN a2enmod rewrite

# Allow all IPs to view error logs (optional debugging)
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# The port used by Render
EXPOSE 80
