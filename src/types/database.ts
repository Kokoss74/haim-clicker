��e x p o r t   t y p e   J s o n   = 
 
     |   s t r i n g 
 
     |   n u m b e r 
 
     |   b o o l e a n 
 
     |   n u l l 
 
     |   {   [ k e y :   s t r i n g ] :   J s o n   |   u n d e f i n e d   } 
 
     |   J s o n [ ] 
 
 
 
 e x p o r t   t y p e   D a t a b a s e   =   { 
 
     p u b l i c :   { 
 
         T a b l e s :   { 
 
             a d m i n s :   { 
 
                 R o w :   { 
 
                     c r e a t e d _ a t :   s t r i n g   |   n u l l 
 
                     f a i l e d _ a t t e m p t s :   n u m b e r 
 
                     i d :   s t r i n g 
 
                     l o c k e d _ u n t i l :   s t r i n g   |   n u l l 
 
                     p a s s w o r d _ h a s h :   s t r i n g 
 
                 } 
 
                 I n s e r t :   { 
 
                     c r e a t e d _ a t ? :   s t r i n g   |   n u l l 
 
                     f a i l e d _ a t t e m p t s ? :   n u m b e r 
 
                     i d ? :   s t r i n g 
 
                     l o c k e d _ u n t i l ? :   s t r i n g   |   n u l l 
 
                     p a s s w o r d _ h a s h :   s t r i n g 
 
                 } 
 
                 U p d a t e :   { 
 
                     c r e a t e d _ a t ? :   s t r i n g   |   n u l l 
 
                     f a i l e d _ a t t e m p t s ? :   n u m b e r 
 
                     i d ? :   s t r i n g 
 
                     l o c k e d _ u n t i l ? :   s t r i n g   |   n u l l 
 
                     p a s s w o r d _ h a s h ? :   s t r i n g 
 
                 } 
 
                 R e l a t i o n s h i p s :   [ ] 
 
             } 
 
             a t t e m p t s :   { 
 
                 R o w :   { 
 
                     c r e a t e d _ a t :   s t r i n g   |   n u l l 
 
                     d i f f e r e n c e :   n u m b e r 
 
                     i d :   s t r i n g 
 
                     u s e r _ i d :   s t r i n g 
 
                 } 
 
                 I n s e r t :   { 
 
                     c r e a t e d _ a t ? :   s t r i n g   |   n u l l 
 
                     d i f f e r e n c e :   n u m b e r 
 
                     i d ? :   s t r i n g 
 
                     u s e r _ i d :   s t r i n g 
 
                 } 
 
                 U p d a t e :   { 
 
                     c r e a t e d _ a t ? :   s t r i n g   |   n u l l 
 
                     d i f f e r e n c e ? :   n u m b e r 
 
                     i d ? :   s t r i n g 
 
                     u s e r _ i d ? :   s t r i n g 
 
                 } 
 
                 R e l a t i o n s h i p s :   [ 
 
                     { 
 
                         f o r e i g n K e y N a m e :   " a t t e m p t s _ u s e r _ i d _ f k e y " 
 
                         c o l u m n s :   [ " u s e r _ i d " ] 
 
                         i s O n e T o O n e :   f a l s e 
 
                         r e f e r e n c e d R e l a t i o n :   " u s e r s " 
 
                         r e f e r e n c e d C o l u m n s :   [ " i d " ] 
 
                     } , 
 
                 ] 
 
             } 
 
             g a m e _ s e t t i n g s :   { 
 
                 R o w :   { 
 
                     a t t e m p t s _ n u m b e r :   n u m b e r 
 
                     d i s c o u n t _ r a n g e s :   J s o n 
 
                     i d :   n u m b e r 
 
                 } 
 
                 I n s e r t :   { 
 
                     a t t e m p t s _ n u m b e r ? :   n u m b e r 
 
                     d i s c o u n t _ r a n g e s ? :   J s o n 
 
                     i d ? :   n u m b e r 
 
                 } 
 
                 U p d a t e :   { 
 
                     a t t e m p t s _ n u m b e r ? :   n u m b e r 
 
                     d i s c o u n t _ r a n g e s ? :   J s o n 
 
                     i d ? :   n u m b e r 
 
                 } 
 
                 R e l a t i o n s h i p s :   [ ] 
 
             } 
 
             u s e r s :   { 
 
                 R o w :   { 
 
                     a t t e m p t s _ l e f t :   n u m b e r 
 
                     b e s t _ r e s u l t :   n u m b e r   |   n u l l 
 
                     c r e a t e d _ a t :   s t r i n g   |   n u l l 
 
                     d i s c o u n t :   n u m b e r 
 
                     i d :   s t r i n g 
 
                     n a m e :   s t r i n g 
 
                     p h o n e :   s t r i n g 
 
                 } 
 
                 I n s e r t :   { 
 
                     a t t e m p t s _ l e f t ? :   n u m b e r 
 
                     b e s t _ r e s u l t ? :   n u m b e r   |   n u l l 
 
                     c r e a t e d _ a t ? :   s t r i n g   |   n u l l 
 
                     d i s c o u n t ? :   n u m b e r 
 
                     i d ? :   s t r i n g 
 
                     n a m e :   s t r i n g 
 
                     p h o n e :   s t r i n g 
 
                 } 
 
                 U p d a t e :   { 
 
                     a t t e m p t s _ l e f t ? :   n u m b e r 
 
                     b e s t _ r e s u l t ? :   n u m b e r   |   n u l l 
 
                     c r e a t e d _ a t ? :   s t r i n g   |   n u l l 
 
                     d i s c o u n t ? :   n u m b e r 
 
                     i d ? :   s t r i n g 
 
                     n a m e ? :   s t r i n g 
 
                     p h o n e ? :   s t r i n g 
 
                 } 
 
                 R e l a t i o n s h i p s :   [ ] 
 
             } 
 
         } 
 
         V i e w s :   { 
 
             [ _   i n   n e v e r ] :   n e v e r 
 
         } 
 
         F u n c t i o n s :   { 
 
             s e t _ u s e r _ r o l e :   { 
 
                 A r g s :   { 
 
                     u s e r _ i d :   s t r i n g 
 
                     r o l e _ n a m e :   s t r i n g 
 
                 } 
 
                 R e t u r n s :   u n d e f i n e d 
 
             } 
 
             u p d a t e _ u s e r _ d i s c o u n t :   { 
 
                 A r g s :   { 
 
                     u s e r _ i d :   s t r i n g 
 
                 } 
 
                 R e t u r n s :   u n d e f i n e d 
 
             } 
 
         } 
 
         E n u m s :   { 
 
             [ _   i n   n e v e r ] :   n e v e r 
 
         } 
 
         C o m p o s i t e T y p e s :   { 
 
             [ _   i n   n e v e r ] :   n e v e r 
 
         } 
 
     } 
 
 } 
 
 
 
 t y p e   P u b l i c S c h e m a   =   D a t a b a s e [ E x t r a c t < k e y o f   D a t a b a s e ,   " p u b l i c " > ] 
 
 
 
 e x p o r t   t y p e   T a b l e s < 
 
     P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s 
 
         |   k e y o f   ( P u b l i c S c h e m a [ " T a b l e s " ]   &   P u b l i c S c h e m a [ " V i e w s " ] ) 
 
         |   {   s c h e m a :   k e y o f   D a t a b a s e   } , 
 
     T a b l e N a m e   e x t e n d s   P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s   {   s c h e m a :   k e y o f   D a t a b a s e   } 
 
         ?   k e y o f   ( D a t a b a s e [ P u b l i c T a b l e N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " T a b l e s " ]   & 
 
                 D a t a b a s e [ P u b l i c T a b l e N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " V i e w s " ] ) 
 
         :   n e v e r   =   n e v e r , 
 
 >   =   P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s   {   s c h e m a :   k e y o f   D a t a b a s e   } 
 
     ?   ( D a t a b a s e [ P u b l i c T a b l e N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " T a b l e s " ]   & 
 
             D a t a b a s e [ P u b l i c T a b l e N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " V i e w s " ] ) [ T a b l e N a m e ]   e x t e n d s   { 
 
             R o w :   i n f e r   R 
 
         } 
 
         ?   R 
 
         :   n e v e r 
 
     :   P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s   k e y o f   ( P u b l i c S c h e m a [ " T a b l e s " ]   & 
 
                 P u b l i c S c h e m a [ " V i e w s " ] ) 
 
         ?   ( P u b l i c S c h e m a [ " T a b l e s " ]   & 
 
                 P u b l i c S c h e m a [ " V i e w s " ] ) [ P u b l i c T a b l e N a m e O r O p t i o n s ]   e x t e n d s   { 
 
                 R o w :   i n f e r   R 
 
             } 
 
             ?   R 
 
             :   n e v e r 
 
         :   n e v e r 
 
 
 
 e x p o r t   t y p e   T a b l e s I n s e r t < 
 
     P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s 
 
         |   k e y o f   P u b l i c S c h e m a [ " T a b l e s " ] 
 
         |   {   s c h e m a :   k e y o f   D a t a b a s e   } , 
 
     T a b l e N a m e   e x t e n d s   P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s   {   s c h e m a :   k e y o f   D a t a b a s e   } 
 
         ?   k e y o f   D a t a b a s e [ P u b l i c T a b l e N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " T a b l e s " ] 
 
         :   n e v e r   =   n e v e r , 
 
 >   =   P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s   {   s c h e m a :   k e y o f   D a t a b a s e   } 
 
     ?   D a t a b a s e [ P u b l i c T a b l e N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " T a b l e s " ] [ T a b l e N a m e ]   e x t e n d s   { 
 
             I n s e r t :   i n f e r   I 
 
         } 
 
         ?   I 
 
         :   n e v e r 
 
     :   P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s   k e y o f   P u b l i c S c h e m a [ " T a b l e s " ] 
 
         ?   P u b l i c S c h e m a [ " T a b l e s " ] [ P u b l i c T a b l e N a m e O r O p t i o n s ]   e x t e n d s   { 
 
                 I n s e r t :   i n f e r   I 
 
             } 
 
             ?   I 
 
             :   n e v e r 
 
         :   n e v e r 
 
 
 
 e x p o r t   t y p e   T a b l e s U p d a t e < 
 
     P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s 
 
         |   k e y o f   P u b l i c S c h e m a [ " T a b l e s " ] 
 
         |   {   s c h e m a :   k e y o f   D a t a b a s e   } , 
 
     T a b l e N a m e   e x t e n d s   P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s   {   s c h e m a :   k e y o f   D a t a b a s e   } 
 
         ?   k e y o f   D a t a b a s e [ P u b l i c T a b l e N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " T a b l e s " ] 
 
         :   n e v e r   =   n e v e r , 
 
 >   =   P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s   {   s c h e m a :   k e y o f   D a t a b a s e   } 
 
     ?   D a t a b a s e [ P u b l i c T a b l e N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " T a b l e s " ] [ T a b l e N a m e ]   e x t e n d s   { 
 
             U p d a t e :   i n f e r   U 
 
         } 
 
         ?   U 
 
         :   n e v e r 
 
     :   P u b l i c T a b l e N a m e O r O p t i o n s   e x t e n d s   k e y o f   P u b l i c S c h e m a [ " T a b l e s " ] 
 
         ?   P u b l i c S c h e m a [ " T a b l e s " ] [ P u b l i c T a b l e N a m e O r O p t i o n s ]   e x t e n d s   { 
 
                 U p d a t e :   i n f e r   U 
 
             } 
 
             ?   U 
 
             :   n e v e r 
 
         :   n e v e r 
 
 
 
 e x p o r t   t y p e   E n u m s < 
 
     P u b l i c E n u m N a m e O r O p t i o n s   e x t e n d s 
 
         |   k e y o f   P u b l i c S c h e m a [ " E n u m s " ] 
 
         |   {   s c h e m a :   k e y o f   D a t a b a s e   } , 
 
     E n u m N a m e   e x t e n d s   P u b l i c E n u m N a m e O r O p t i o n s   e x t e n d s   {   s c h e m a :   k e y o f   D a t a b a s e   } 
 
         ?   k e y o f   D a t a b a s e [ P u b l i c E n u m N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " E n u m s " ] 
 
         :   n e v e r   =   n e v e r , 
 
 >   =   P u b l i c E n u m N a m e O r O p t i o n s   e x t e n d s   {   s c h e m a :   k e y o f   D a t a b a s e   } 
 
     ?   D a t a b a s e [ P u b l i c E n u m N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " E n u m s " ] [ E n u m N a m e ] 
 
     :   P u b l i c E n u m N a m e O r O p t i o n s   e x t e n d s   k e y o f   P u b l i c S c h e m a [ " E n u m s " ] 
 
         ?   P u b l i c S c h e m a [ " E n u m s " ] [ P u b l i c E n u m N a m e O r O p t i o n s ] 
 
         :   n e v e r 
 
 
 
 e x p o r t   t y p e   C o m p o s i t e T y p e s < 
 
     P u b l i c C o m p o s i t e T y p e N a m e O r O p t i o n s   e x t e n d s 
 
         |   k e y o f   P u b l i c S c h e m a [ " C o m p o s i t e T y p e s " ] 
 
         |   {   s c h e m a :   k e y o f   D a t a b a s e   } , 
 
     C o m p o s i t e T y p e N a m e   e x t e n d s   P u b l i c C o m p o s i t e T y p e N a m e O r O p t i o n s   e x t e n d s   { 
 
         s c h e m a :   k e y o f   D a t a b a s e 
 
     } 
 
         ?   k e y o f   D a t a b a s e [ P u b l i c C o m p o s i t e T y p e N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " C o m p o s i t e T y p e s " ] 
 
         :   n e v e r   =   n e v e r , 
 
 >   =   P u b l i c C o m p o s i t e T y p e N a m e O r O p t i o n s   e x t e n d s   {   s c h e m a :   k e y o f   D a t a b a s e   } 
 
     ?   D a t a b a s e [ P u b l i c C o m p o s i t e T y p e N a m e O r O p t i o n s [ " s c h e m a " ] ] [ " C o m p o s i t e T y p e s " ] [ C o m p o s i t e T y p e N a m e ] 
 
     :   P u b l i c C o m p o s i t e T y p e N a m e O r O p t i o n s   e x t e n d s   k e y o f   P u b l i c S c h e m a [ " C o m p o s i t e T y p e s " ] 
 
         ?   P u b l i c S c h e m a [ " C o m p o s i t e T y p e s " ] [ P u b l i c C o m p o s i t e T y p e N a m e O r O p t i o n s ] 
 
         :   n e v e r 
 
 